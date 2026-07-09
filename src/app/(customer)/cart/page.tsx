// src/app/(customer)/cart/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, AlertCircle } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { isProductAvailable, getUnavailableReason } from "@/lib/utils";
import QuantityControl from "@/components/shared/QuantityControl";
import Checkbox from "@/components/shared/Checkbox";
import EmptyState from "@/components/shared/EmptyState";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

function CartContent() {
  const { items, updateQuantity, removeItem, removeItems, getSubtotal } =
    useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 구매 가능한 아이템만 선택 가능
  const availableItems = items.filter((item) =>
    isProductAvailable(item.product, item.size),
  );
  const unavailableItems = items.filter(
    (item) => !isProductAvailable(item.product, item.size),
  );
  const toggleSelect = (id: string) => {
    // 비활성 상품은 선택 불가
    const item = items.find((i) => i.id === id);
    if (!item || !isProductAvailable(item.product, item.size)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    // 구매 가능한 상품만 전체 선택
    const availableIds = availableItems.map((i) => i.id);
    const allSelected = availableIds.every((id) => selected.has(id));
    setSelected(allSelected ? new Set() : new Set(availableIds));
  };

  const handleRemoveSelected = async () => {
    if (selected.size === 0) return;
    await removeItems([...selected]);
    setSelected(new Set());
  };

  const subtotal = getSubtotal([...selected]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
        Cart
      </h1>

      {items.length === 0 ? (
        <EmptyState
          message="Your cart is empty."
          linkLabel="Browse Products →"
          linkHref="/products"
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* 전체 선택 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <Checkbox
                  checked={
                    availableItems.length > 0 &&
                    availableItems.every((i) => selected.has(i.id))
                  }
                  onChange={toggleAll}
                />
                Select All ({availableItems.length} available)
              </label>
              <button
                onClick={handleRemoveSelected}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 text-sm text-gray-400 
                           hover:text-red-500 transition-colors 
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Delete Selected
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => {
                const available = isProductAvailable(item.product, item.size);
                const reason = getUnavailableReason(item.product, item.size);

                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-4 p-4 border transition-colors
                      ${
                        available
                          ? "bg-white border-gray-200"
                          : "bg-gray-50 border-gray-200 opacity-70"
                      }`}
                  >
                    {/* 체크박스 — 비활성이면 disabled */}
                    <Checkbox
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className={`mt-1 ${!available ? "cursor-not-allowed opacity-30" : ""}`}
                    />

                    {/* 이미지 */}
                    <Link
                      href={`/products/${item.productId}`}
                      className="flex-shrink-0"
                    >
                      <div className="relative w-20 h-24 bg-gray-100">
                        {item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            fill
                            className={`object-cover ${!available ? "grayscale" : ""}`}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center 
                                          text-gray-300 text-xs"
                          >
                            No Img
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider">
                        {item.product.brand}
                      </p>
                      <Link href={`/products/${item.productId}`}>
                        <p
                          className="text-sm font-medium text-gray-800 
                                      hover:text-primary transition-colors line-clamp-2 mt-0.5"
                        >
                          {item.product.name}
                        </p>
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {item.size}
                      </p>

                      {/* 비활성 사유 표시 */}
                      {!available && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <AlertCircle
                            size={13}
                            className="text-red-400 flex-shrink-0"
                          />
                          <p className="text-xs text-red-500 font-medium">
                            {reason}
                          </p>
                        </div>
                      )}

                      {/* 수량 + 가격 */}
                      <div className="flex items-center justify-between mt-3">
                        {available ? (
                          <QuantityControl
                            quantity={item.quantity}
                            onIncrease={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            onDecrease={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            size="sm"
                          />
                        ) : (
                          // 비활성이면 수량 조절 불가
                          <div className="flex items-center border border-gray-200 bg-gray-100">
                            <span className="px-4 py-1.5 text-sm text-gray-400">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        )}

                        <p
                          className={`text-sm font-semibold
                          ${available ? "text-gray-900" : "text-gray-400 line-through"}`}
                        >
                          ${(item.product.price * item.quantity).toFixed(2)} CAD
                        </p>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 비활성 상품 안내 */}
            {unavailableItems.length > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 p-3">
                <AlertCircle
                  size={15}
                  className="text-amber-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-amber-700">
                  You cannot purchase {unavailableItems.length} items. These
                  items will be excluded from the payment. We recommend removing
                  them from your cart.
                </p>
              </div>
            )}
          </div>

          {/* 주문 요약 */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white border border-gray-200 p-6 sticky top-24">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>
                    Subtotal
                    {selected.size > 0 && (
                      <span className="text-gray-400 ml-1">
                        ({selected.size} items)
                      </span>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
              </div>

              <div
                className="border-t border-gray-200 mt-4 pt-4 flex justify-between 
                              font-semibold text-gray-900"
              >
                <span>Estimated Total</span>
                <span>${subtotal.toFixed(2)} CAD</span>
              </div>

              {selected.size === 0 && (
                <p className="mt-3 text-xs text-amber-600 text-center">
                  Select items to proceed
                </p>
              )}

              <Link
                href={
                  selected.size > 0
                    ? `/checkout?items=${[...selected].join(",")}`
                    : "#"
                }
                onClick={(e) => {
                  if (selected.size === 0) e.preventDefault();
                }}
                className={`mt-4 block text-center py-3.5 text-sm font-semibold 
                            tracking-wide transition-colors duration-200
                  ${
                    selected.size > 0
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-gray-500 
                           hover:text-primary transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
