// src/app/api/stripe/create-payment-intent/route.ts
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    // Firebase 토큰으로 유저 인증
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

    // Firestore에서 카트 아이템 조회 (가격 서버에서 검증)
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

    // 금액 서버에서 직접 계산 (클라이언트 금액 신뢰 X)
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const shipping = 25.0; // 고정 배송비 (CAD)
    const taxRate = 0.13; // Ontario HST 13%
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;

    // Stripe PaymentIntent 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents 단위
      currency: "cad",
      metadata: {
        userId,
        itemIds: itemIds.join(","),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      breakdown: {
        subtotal: Number(subtotal.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
