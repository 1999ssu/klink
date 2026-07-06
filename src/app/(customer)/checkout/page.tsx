// src/app/(customer)/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Address } from "@/types";
import { ChevronDown, ChevronUp, MapPin, Edit2, Plus } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import AddressPopup from "@/components/customer/checkout/AddressPopup";
import AddressListPopup from "@/components/customer/checkout/AddressListPopup";
import PriceSummary from "@/components/shared/PriceSummary";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// 가격 breakdown 타입
interface Breakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const itemIds = searchParams.get("items")?.split(",") ?? [];

  const { user } = useAuthStore();
  const { items } = useCartStore();
  const selectedItems = items.filter((item) => itemIds.includes(item.id));

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddressAdd, setShowAddressAdd] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false); // 상품 목록 드롭다운

  // 기본 주소 자동 선택
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(() => {
    if (!user?.addresses?.length) return null;
    return user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
  });

  // PaymentIntent 생성
  // 대체 코드
  useEffect(() => {
    if (!selectedAddress || !itemIds.length) return;
    let cancelled = false;

    const createPaymentIntent = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ itemIds, shippingAddress: selectedAddress }),
        });
        const data = await res.json();
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        setBreakdown(data.breakdown);
      } catch (err) {
        console.error("Failed to create payment intent:", err);
      }
    };

    createPaymentIntent();
    return () => {
      cancelled = true;
    };
  }, [selectedAddress]); // itemIds는 URL에서 오는 값이라 변하지 않으므로 제외

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-10">
        Checkout
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 좌측: 배송지 + 상품 목록 */}
        <div className="flex-1 space-y-6">
          {/* ① Shipping Address */}
          <section className="bg-white border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Shipping Address
              </h2>
              {selectedAddress && (
                <button
                  onClick={() => setShowAddressList(true)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
              )}
            </div>

            {selectedAddress ? (
              // 선택된 주소 표시
              <div className="text-sm text-gray-700 space-y-0.5">
                <p className="font-medium">
                  {selectedAddress.firstName} {selectedAddress.lastName}
                </p>
                <p>{selectedAddress.street}</p>
                <p>
                  {selectedAddress.city}, {selectedAddress.province}{" "}
                  {selectedAddress.postalCode}
                </p>
                <p>{selectedAddress.country}</p>
                <p className="text-gray-400">{selectedAddress.phone}</p>
              </div>
            ) : (
              // 주소 없을 때
              <button
                onClick={() => setShowAddressAdd(true)}
                className="flex items-center gap-2 text-sm text-primary border border-dashed 
                           border-primary px-4 py-3 w-full justify-center hover:bg-cream transition-colors"
              >
                <Plus size={14} />
                Add New Address
              </button>
            )}
          </section>

          {/* ② Shipping Method (주문 상품 목록) */}
          <section className="bg-white border border-gray-200 p-6">
            <button
              onClick={() => setOrderOpen((p) => !p)}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-900"
            >
              <span>Shipping Method</span>
              {orderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* 상품 목록 드롭다운 */}
            {orderOpen && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-12 h-14 bg-gray-100 flex-shrink-0 overflow-hidden relative">
                      {item.product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Size: {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium flex-shrink-0">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 배송 방법 (고정) */}
            <div className="mt-4 border border-primary bg-cream p-3 text-sm">
              <div className="flex justify-between font-medium">
                <span>International Shipping (Korea → Canada)</span>
                <span>$25.00 CAD</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Estimated delivery: 7–14 business days via forwarding warehouse
              </p>
            </div>
          </section>

          {/* ③ 결제 폼 (Stripe) */}
          {clientSecret && (
            <section className="bg-white border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Payment
              </h2>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#852623",
                      colorBackground: "#ffffff",
                      fontFamily: "Inter, sans-serif",
                      borderRadius: "0px",
                    },
                  },
                }}
              >
                <PaymentForm
                  breakdown={breakdown}
                  selectedAddress={selectedAddress}
                />
              </Elements>
            </section>
          )}

          {/* 주소 없거나 로딩 중 */}
          {!clientSecret && selectedAddress && (
            <div className="bg-white border border-gray-200 p-6">
              <div className="h-40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* 우측: Order Summary */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white border border-gray-200 p-6 sticky top-24">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <PriceSummary
              rows={[
                { label: "Subtotal", value: breakdown?.subtotal ?? 0 },
                { label: "Shipping", value: breakdown?.shipping ?? 0 },
                { label: "Taxes (HST 13%)", value: breakdown?.tax ?? 0 },
                { label: "Total", value: breakdown?.total ?? 0, bold: true },
              ]}
            />

            {/* 정책 안내 */}
            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
              ⚠️ All sales are final. No returns or exchanges on international
              orders.
            </p>
          </div>
        </div>
      </div>

      {/* 주소 목록 팝업 */}
      {showAddressList && user && (
        <AddressListPopup
          addresses={user.addresses}
          selectedId={selectedAddress?.id ?? null}
          onSelect={(addr) => {
            setSelectedAddress(addr);
            setShowAddressList(false);
          }}
          onAddNew={() => {
            setShowAddressList(false);
            setShowAddressAdd(true);
          }}
          onClose={() => setShowAddressList(false)}
        />
      )}

      {/* 주소 추가 팝업 */}
      {showAddressAdd && (
        <AddressPopup
          onClose={() => setShowAddressAdd(false)}
          onSaved={(addr) => {
            setSelectedAddress(addr);
            setShowAddressAdd(false);
          }}
        />
      )}
    </div>
  );
}

// ── Stripe 결제 폼 컴포넌트 ──────────────────────────────
function PaymentForm({
  breakdown,
  selectedAddress,
}: {
  breakdown: Breakdown | null;
  selectedAddress: Address | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!stripe || !elements || !selectedAddress) return;
    setIsProcessing(true);
    setErrorMsg(null);

    // Stripe Elements 유효성 검사
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMsg(submitError.message ?? "Payment failed.");
      setIsProcessing(false);
      return;
    }

    // 결제 확인
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: {
            name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
            phone: selectedAddress.phone,
            address: {
              line1: selectedAddress.street,
              city: selectedAddress.city,
              state: selectedAddress.province,
              postal_code: selectedAddress.postalCode,
              country: "CA",
            },
          },
        },
      },
    });

    if (error) {
      setErrorMsg(error.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    }
    // 성공 시 return_url로 자동 리다이렉트됨
  };

  return (
    <div className="space-y-5">
      <PaymentElement />

      {errorMsg && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-4 py-3">
          {errorMsg}
        </p>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={!stripe || isProcessing || !selectedAddress}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing
          ? "Processing..."
          : `Place Order · $${breakdown?.total.toFixed(2) ?? "—"} CAD`}
      </button>
    </div>
  );
}
