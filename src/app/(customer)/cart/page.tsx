// src/app/(customer)/cart/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(
      selected.size === items.length
        ? new Set()
        : new Set(items.map((i) => i.id)),
    );
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
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-primary text-sm hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 카트 아이템 목록 */}
          <div className="flex-1">
            {/* 전체 선택 + 선택 삭제 */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selected.size === items.length && items.length > 0}
                  onChange={toggleAll}
                  className="accent-primary"
                />
                Select All ({items.length})
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

            {/* 아이템 리스트 */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-white border border-gray-200"
                >
                  {/* 체크박스 */}
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="accent-primary mt-1 flex-shrink-0"
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
                          className="object-cover"
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
                        className="text-sm font-medium text-gray-800 hover:text-primary 
                                    transition-colors line-clamp-2 mt-0.5"
                      >
                        {item.product.name}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.size}
                    </p>

                    {/* 수량 조절 + 단가 */}
                    <div className="flex items-center justify-between mt-3">
                      {/* 수량 */}
                      <div className="flex items-center border border-gray-300">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors 
                                     disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-medium border-x border-gray-300 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* 소계 */}
                      <p className="text-sm font-semibold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)} CAD
                      </p>
                    </div>
                  </div>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 주문 요약 사이드바 */}
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

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-semibold text-gray-900">
                <span>Estimated Total</span>
                <span>${subtotal.toFixed(2)} CAD</span>
              </div>

              {/* 선택 없으면 안내 */}
              {selected.size === 0 && (
                <p className="mt-3 text-xs text-amber-600 text-center">
                  Select items to proceed
                </p>
              )}

              {/* Proceed to Checkout */}
              <Link
                href={
                  selected.size > 0
                    ? `/checkout?items=${[...selected].join(",")}`
                    : "#"
                }
                onClick={(e) => {
                  if (selected.size === 0) e.preventDefault();
                }}
                className={`
                  mt-4 block text-center py-3.5 text-sm font-semibold tracking-wide 
                  transition-colors duration-200
                  ${
                    selected.size > 0
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="mt-3 block text-center text-sm text-gray-500 hover:text-primary transition-colors"
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
