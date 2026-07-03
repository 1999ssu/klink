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
      // 카트 아이템 조회
      const cartSnap = await adminDb
        .collection("cart")
        .doc(userId)
        .collection("items")
        .get();

      const purchasedItems = cartSnap.docs
        .filter((doc) => itemIdList.includes(doc.id))
        .map((doc) => doc.data());

      // 유저 정보 조회
      const userDoc = await adminDb.collection("users").doc(userId).get();
      const userData = userDoc.data()!;

      // 금액 계산 (중복 제거)
      const breakdown = calculateBreakdown(
        purchasedItems.map((item) => ({
          price: item.product.price,
          quantity: item.quantity,
        })),
      );

      // Firestore에 주문 생성
      await adminDb.collection("orders").add({
        userId,
        userEmail: userData.email,
        items: purchasedItems.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          brand: item.product.brand,
          image: item.product.images?.[0] ?? "",
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
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

      // 결제된 카트 아이템 삭제
      const batch = adminDb.batch();
      cartSnap.docs
        .filter((doc) => itemIdList.includes(doc.id))
        .forEach((doc) => batch.delete(doc.ref));
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
