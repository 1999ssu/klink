// src/app/(customer)/wish/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types";
import { isProductAvailable, getUnavailableReason } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import Checkbox from "@/components/shared/Checkbox";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import toast from "react-hot-toast";

// Firestore에 저장된 위시 문서 타입 (productId만 있음)
interface WishDoc {
  id: string;
  productId: string;
}

// 실제 렌더링에 쓸 타입 (최신 상품 정보 포함)
interface WishItem {
  wishId: string;
  productId: string;
  product: Product;
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
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 위시리스트 + 최신 상품 정보 fetch
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchWish = async () => {
      try {
        // 1. 위시 목록 (productId만 있음)
        const snapshot = await getDocs(
          collection(db, "wishlist", user.id, "items"),
        );
        const wishDocs = snapshot.docs.map((d) => ({
          id: d.id,
          productId: d.data().productId,
        })) as WishDoc[];

        if (wishDocs.length === 0) {
          if (!cancelled) setItems([]);
          return;
        }

        // 2. 최신 상품 정보 fetch
        const productSnaps = await Promise.all(
          wishDocs.map((w) => getDoc(doc(db, "products", w.productId))),
        );

        if (cancelled) return;

        // 3. 합치기 (삭제된 상품 제외)
        const wishItems: WishItem[] = wishDocs
          .map((wish, i) => {
            const snap = productSnaps[i];
            if (!snap.exists()) return null;
            return {
              wishId: wish.id,
              productId: wish.productId,
              product: {
                id: snap.id,
                ...snap.data(),
                createdAt: snap.data().createdAt?.toDate(),
                updatedAt: snap.data().updatedAt?.toDate(),
              } as Product,
            };
          })
          .filter(Boolean) as WishItem[];

        setItems(wishItems);
      } catch (err) {
        console.error("Failed to fetch wishlist:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchWish();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const availableItems = items.filter((i) => isProductAvailable(i.product));

  const toggleSelect = (wishId: string) => {
    const item = items.find((i) => i.wishId === wishId);
    if (!item || !isProductAvailable(item.product)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(wishId) ? next.delete(wishId) : next.add(wishId);
      return next;
    });
  };

  const toggleAll = () => {
    const availableIds = availableItems.map((i) => i.wishId);
    const allSelected = availableIds.every((id) => selected.has(id));
    setSelected(allSelected ? new Set() : new Set(availableIds));
  };

  const removeOne = async (wishId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "wishlist", user.id, "items", wishId));
    setItems((prev) => prev.filter((i) => i.wishId !== wishId));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(wishId);
      return next;
    });
    toast.success("Removed from wishlist");
  };

  const removeSelected = async () => {
    if (!user || selected.size === 0) return;
    await Promise.all(
      [...selected].map((wishId) =>
        deleteDoc(doc(db, "wishlist", user.id, "items", wishId)),
      ),
    );
    setItems((prev) => prev.filter((i) => !selected.has(i.wishId)));
    setSelected(new Set());
    toast.success("Removed selected items");
  };

  const selectedTotal = items
    .filter((i) => selected.has(i.wishId) && isProductAvailable(i.product))
    .reduce((sum, i) => sum + i.product.price, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PageSkeleton rows={3} height="h-24" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
        Wishlist
      </h1>

      {items.length === 0 ? (
        <EmptyState
          message="Your wishlist is empty."
          linkLabel="Browse Products →"
          linkHref="/products"
        />
      ) : (
        <>
          {/* 전체 선택 + 일괄 액션 */}
          <div className="flex items-center justify-between mb-4 py-3 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <Checkbox
                checked={
                  availableItems.length > 0 &&
                  availableItems.every((i) => selected.has(i.wishId))
                }
                onChange={toggleAll}
              />
              Select All ({availableItems.length} available)
            </label>

            <div className="flex gap-2">
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

          {/* 위시 아이템 */}
          <div className="space-y-3">
            {items.map((item) => {
              const available = isProductAvailable(item.product);
              const reason = getUnavailableReason(item.product);

              return (
                <div
                  key={item.wishId}
                  className={`flex items-center gap-4 p-4 border
                    ${
                      available
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-200 opacity-70"
                    }`}
                >
                  <Checkbox
                    checked={selected.has(item.wishId)}
                    onChange={() => toggleSelect(item.wishId)}
                    className={
                      !available ? "cursor-not-allowed opacity-30" : ""
                    }
                  />

                  <Link
                    href={`/products/${item.productId}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-16 h-20 bg-gray-100">
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

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">
                      {item.product.brand}
                    </p>
                    <Link href={`/products/${item.productId}`}>
                      <p
                        className={`text-sm font-medium line-clamp-2 mt-0.5 transition-colors
                        ${
                          available
                            ? "text-gray-800 hover:text-primary"
                            : "text-gray-400"
                        }`}
                      >
                        {item.product.name}
                      </p>
                    </Link>
                    <p
                      className={`text-sm font-semibold mt-1
                      ${available ? "text-gray-900" : "text-gray-400 line-through"}`}
                    >
                      ${item.product.price.toFixed(2)} CAD
                    </p>

                    {/* 비활성 사유 */}
                    {!available && reason && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <AlertCircle
                          size={12}
                          className="text-red-400 flex-shrink-0"
                        />
                        <p className="text-xs text-red-500">{reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/products/${item.productId}`}
                      className={`p-2 border transition-colors
                        ${
                          available
                            ? "border-gray-300 text-gray-500 hover:border-primary hover:text-primary"
                            : "border-gray-200 text-gray-300 cursor-not-allowed pointer-events-none"
                        }`}
                      title="Go to product"
                    >
                      <ShoppingCart size={15} />
                    </Link>
                    <button
                      onClick={() => removeOne(item.wishId)}
                      className="p-2 border border-gray-300 text-gray-500 
                                 hover:border-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
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
