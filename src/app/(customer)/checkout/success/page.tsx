// src/app/(customer)/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get("payment_intent");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 살짝 딜레이 후 애니메이션
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div
        className={`text-center max-w-md transition-all duration-500
          ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <CheckCircle size={56} className="text-green-500 mx-auto mb-5" />
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 leading-relaxed mb-2">
          Thank you for your order. We&apos;ll start processing it right away.
        </p>
        <p className="text-gray-500 leading-relaxed mb-8">
          Once your items arrive at our warehouse in Korea, they&apos;ll be
          inspected and shipped to your address in Canada.
        </p>

        {paymentIntentId && (
          <p className="text-xs text-gray-400 mb-8">
            Order ref: <span className="font-mono">{paymentIntentId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/mypage/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link href="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
