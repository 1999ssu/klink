// src/app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { calculateBreakdown } from "@/lib/stripe-helpers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const userId = decoded.uid;

    const { itemIds, shippingAddress } = await req.json();

    if (!itemIds?.length || !shippingAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. 카트 아이템 조회 (productId, size, quantity만 저장됨)
    const cartSnap = await adminDb
      .collection("cart")
      .doc(userId)
      .collection("items")
      .get();

    const cartItems = cartSnap.docs.filter((doc) => itemIds.includes(doc.id));

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No valid cart items" },
        { status: 400 },
      );
    }

    // 2. productId로 실제 상품 가격 조회
    const productSnapshots = await Promise.all(
      cartItems.map((item) =>
        adminDb.collection("products").doc(item.data().productId).get(),
      ),
    );

    // 3. 가격 + 수량 조합
    const itemsForCalculation = cartItems
      .map((item, i) => {
        const productSnap = productSnapshots[i];
        if (!productSnap.exists) return null;
        return {
          price: productSnap.data()!.price as number,
          quantity: item.data().quantity as number,
        };
      })
      .filter(Boolean) as { price: number; quantity: number }[];

    if (itemsForCalculation.length === 0) {
      return NextResponse.json(
        { error: "Products not found" },
        { status: 400 },
      );
    }

    // 4. 금액 계산
    const breakdown = calculateBreakdown(itemsForCalculation);

    // 5. Stripe PaymentIntent 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(breakdown.total * 100),
      currency: "cad",
      metadata: {
        userId,
        itemIds: itemIds.join(","),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      breakdown,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
