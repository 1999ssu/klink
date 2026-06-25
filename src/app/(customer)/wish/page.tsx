// src/app/(customer)/wish/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/hooks/useCart";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import toast from "react-hot-toast";

// Firestore wishlist 문서 타입
interface WishDoc {
  id: string; // doc id = productId
  productId: string;
  productName: string;
  brand: string;
  price: number;
  image: string;
}

export default function WishPage() {
  return (
    <ProtectedRoute>
      <WishContent />
    </ProtectedRoute>
  );
}

function WishContent() {
  const { user } = useAuthStore();
  const { addToCart } = useCart();

  const [items, setItems] = useState<WishDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 위시리스트 불러오기
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetch = async () => {
      const snapshot = await getDocs(
        collection(db, "wishlist", user.id, "items"),
      );
      if (cancelled) return;
      setItems(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as WishDoc[],
      );
      setLoading(false);
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // 체크박스
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

  // 단일 삭제
  const removeOne = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "wishlist", user.id, "items", id));
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success("Removed from wishlist");
  };

  // 선택 삭제 / 전체 삭제
  const removeSelected = async () => {
    if (!user || selected.size === 0) return;
    await Promise.all(
      [...selected].map((id) =>
        deleteDoc(doc(db, "wishlist", user.id, "items", id)),
      ),
    );
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    toast.success("Removed selected items");
  };

  // 단일 카트 이동
  const moveOneToCart = async (item: WishDoc) => {
    // 상품 최소 정보로 Product 타입 구성 (size는 상세 페이지에서 선택하도록 안내)
    toast("Please select a size on the product page.", { icon: "ℹ️" });
  };

  // 선택 카트 이동 (사이즈 선택 필요하므로 상세 페이지로 안내)
  const moveSelectedToCart = () => {
    if (selected.size === 0) return;
    toast(
      "Please visit each product page to select a size before adding to cart.",
      { icon: "ℹ️" },
    );
  };

  // 선택 상품 총액
  const selectedTotal = items
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + i.price, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-primary text-sm hover:underline"
          >
            Browse Products →
          </Link>
        </div>
      ) : (
        <>
          {/* 전체 선택 + 일괄 액션 */}
          <div className="flex items-center justify-between mb-4 py-3 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleAll}
                className="accent-primary"
              />
              Select All ({items.length})
            </label>

            <div className="flex gap-2">
              <button
                onClick={moveSelectedToCart}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 
                           hover:border-primary hover:text-primary transition-colors 
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={14} />
                Move to Cart
              </button>
              <button
                onClick={removeSelected}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 
                           hover:border-red-400 hover:text-red-500 transition-colors 
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>

          {/* 위시리스트 아이템 */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200"
              >
                {/* 체크박스 */}
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="accent-primary flex-shrink-0"
                />

                {/* 이미지 */}
                <Link
                  href={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-16 h-20 bg-gray-100">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No Img
                      </div>
                    )}
                  </div>
                </Link>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    {item.brand}
                  </p>
                  <Link href={`/products/${item.productId}`}>
                    <p
                      className="text-sm font-medium text-gray-800 hover:text-primary 
                                  transition-colors line-clamp-2 mt-0.5"
                    >
                      {item.productName}
                    </p>
                  </Link>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    ${item.price.toFixed(2)} CAD
                  </p>
                </div>

                {/* 개별 액션 버튼 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="p-2 border border-gray-300 text-gray-500 hover:border-primary 
                               hover:text-primary transition-colors"
                    title="Go to product to add to cart"
                  >
                    <ShoppingCart size={15} />
                  </Link>
                  <button
                    onClick={() => removeOne(item.id)}
                    className="p-2 border border-gray-300 text-gray-500 hover:border-red-400 
                               hover:text-red-500 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 총액 */}
          {selected.size > 0 && (
            <div className="mt-6 flex justify-end">
              <div className="bg-white border border-gray-200 px-6 py-4 text-right">
                <p className="text-sm text-gray-500">
                  Selected ({selected.size} items)
                </p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  ${selectedTotal.toFixed(2)}{" "}
                  <span className="text-sm font-normal text-gray-400">CAD</span>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
