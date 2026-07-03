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

    // Firestore에서 카트 아이템 조회
    const cartSnap = await adminDb
      .collection("cart")
      .doc(userId)
      .collection("items")
      .get();

    const cartItems = cartSnap.docs
      .filter((doc) => itemIds.includes(doc.id))
      .map((doc) => doc.data());

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No valid cart items" },
        { status: 400 },
      );
    }

    // 금액 계산 (중복 제거)
    const breakdown = calculateBreakdown(
      cartItems.map((item) => ({
        price: item.product.price,
        quantity: item.quantity,
      })),
    );

    // Stripe PaymentIntent 생성
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
