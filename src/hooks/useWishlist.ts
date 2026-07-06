// src/hooks/useWishlist.ts
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { setSubDoc, deleteSubDoc } from "@/lib/firestore-crud";
import { useAuthStore } from "@/store/authStore";
import { Product } from "@/types";
import toast from "react-hot-toast";

export function useWishlist(productId: string) {
  const { user } = useAuthStore();
  const [isWished, setIsWished] = useState(false);

  // 위시 여부 확인
  useEffect(() => {
    if (!user) return;
    const checkWish = async () => {
      const ref = doc(db, "wishlist", user.id, "items", productId);
      const snap = await getDoc(ref);
      setIsWished(snap.exists());
    };
    checkWish();
  }, [user, productId]);

  // 위시 토글
  const toggleWish = async (product: Product) => {
    if (!user) return;

    if (isWished) {
      await deleteSubDoc("wishlist", user.id, "items", productId);
      setIsWished(false);
      toast.success("Removed from wishlist");
    } else {
      await setSubDoc("wishlist", user.id, "items", productId, {
        productId,
        productName: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0] ?? "",
      });
      setIsWished(true);
      toast.success("Added to wishlist ♥");
    }
  };

  return { isWished, toggleWish };
}
