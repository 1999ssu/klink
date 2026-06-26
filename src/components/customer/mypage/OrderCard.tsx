// src/components/customer/mypage/OrderCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { format } from "date-fns";

// 주문 상태별 스타일
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Paid", color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-700" },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600" },
};

interface Props {
  order: Order;
}

export default function OrderCard({ order }: Props) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white border border-gray-200">
      {/* 주문 헤더 */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* 좌측: 날짜 + 주문 ID */}
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              {order.createdAt ? format(order.createdAt, "MMM d, yyyy") : "—"}
            </p>
            <p className="text-xs font-mono text-gray-400">
              #{order.id.slice(0, 12).toUpperCase()}
            </p>
          </div>

          {/* 우측: 상태 + 총액 */}
          <div className="text-right">
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 ${status.color}`}
            >
              {status.label}
            </span>
            <p className="text-sm font-bold text-gray-900 mt-1.5">
              ${order.total.toFixed(2)} CAD
            </p>
          </div>
        </div>

        {/* 상품 썸네일 미리보기 (최대 4개) */}
        <div className="flex gap-2 mt-3">
          {order.items.slice(0, 4).map((item, i) => (
            <div
              key={i}
              className="relative w-12 h-14 bg-gray-100 flex-shrink-0 overflow-hidden"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                  No Img
                </div>
              )}
            </div>
          ))}
          {order.items.length > 4 && (
            <div className="w-12 h-14 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              +{order.items.length - 4}
            </div>
          )}
        </div>

        {/* 상세 토글 버튼 */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-3 flex items-center gap-1 text-xs text-gray-500 
                     hover:text-primary transition-colors"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Hide details" : "View details"}
        </button>
      </div>

      {/* 주문 상세 (펼쳤을 때) */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-5">
          {/* 주문 상품 목록 */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative w-14 h-16 bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center 
                                      text-gray-300 text-[10px]"
                      >
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {item.brand}
                    </p>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 배송지 */}
          {order.shippingAddress && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Shipping Address
              </h3>
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* 금액 breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment Summary
            </h3>
            <div className="space-y-1.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)} CAD</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)} CAD</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span>${order.tax.toFixed(2)} CAD</span>
              </div>
              <div
                className="flex justify-between font-bold text-gray-900 pt-2 
                              border-t border-gray-200"
              >
                <span>Total</span>
                <span>${order.total.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>

          {/* 반품 정책 안내 */}
          <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 border border-gray-100">
            ⚠️ All sales are final. No returns or exchanges on international
            orders.
          </p>
        </div>
      )}
    </div>
  );
}
