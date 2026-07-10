// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { calculateBreakdown } from "@/lib/stripe-helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { userId, itemIds } = paymentIntent.metadata;
    const itemIdList = itemIds.split(",");

    try {
      // 1. 카트 아이템 조회
      const cartSnap = await adminDb
        .collection("cart")
        .doc(userId)
        .collection("items")
        .get();

      const purchasedCartItems = cartSnap.docs.filter((doc) =>
        itemIdList.includes(doc.id),
      );

      // 2. productId로 최신 상품 정보 조회
      const productSnapshots = await Promise.all(
        purchasedCartItems.map((item) =>
          adminDb.collection("products").doc(item.data().productId).get(),
        ),
      );

      // 3. 유저 정보 조회
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data()!;

      // 4. 금액 계산
      const itemsForCalculation = purchasedCartItems
        .map((item, i) => {
          const productSnap = productSnapshots[i];
          if (!productSnap.exists) return null;
          return {
            price: productSnap.data()!.price as number,
            quantity: item.data().quantity as number,
          };
        })
        .filter(Boolean) as { price: number; quantity: number }[];

      const breakdown = calculateBreakdown(itemsForCalculation);

      // 5. 주문 생성
      await adminDb.collection("orders").add({
        userId,
        userEmail: userData.email,
        items: purchasedCartItems.map((item, i) => {
          const productSnap = productSnapshots[i];
          const productData = productSnap.data()!;
          return {
            productId: item.data().productId,
            productName: productData.name,
            brand: productData.brand,
            image: productData.images?.[0] ?? "",
            size: item.data().size,
            quantity: item.data().quantity,
            price: productData.price,
          };
        }),
        shippingAddress:
          userData.addresses?.find(
            (a: { isDefault: boolean }) => a.isDefault,
          ) ?? null,
        status: "paid",
        stripePaymentIntentId: paymentIntent.id,
        ...breakdown,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 6. 결제된 카트 아이템 삭제
      const batch = adminDb.batch();
      purchasedCartItems.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (err) {
      console.error("Order creation failed:", err);
      return NextResponse.json(
        { error: "Order creation failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
