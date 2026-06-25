// src/hooks/useCart.ts
"use client";

import { useEffect } from "react";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { CartItem, Product } from "@/types";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export function useCart() {
  const { user } = useAuthStore();
  const { items, setItems } = useCartStore();

  // 카트 데이터 Firestore에서 불러오기
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      const snapshot = await getDocs(collection(db, "cart", user.id, "items"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CartItem[];
      setItems(data);
    };

    fetchCart();
  }, [user, setItems]);

  // 카트에 상품 추가
  const addToCart = async (product: Product, size: string, quantity = 1) => {
    if (!user) {
      toast.error("Please sign in to add items to cart.");
      return;
    }

    // 동일 상품 + 사이즈가 이미 있으면 수량만 증가
    const existing = items.find(
      (item) => item.productId === product.id && item.size === size,
    );

    if (existing) {
      const ref = doc(db, "cart", user.id, "items", existing.id);
      await updateDoc(ref, { quantity: existing.quantity + quantity });
      setItems(
        items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      const newItem: CartItem = {
        id: uuidv4(),
        productId: product.id,
        product,
        size,
        quantity,
      };
      const ref = doc(db, "cart", user.id, "items", newItem.id);
      await setDoc(ref, {
        productId: product.id,
        product,
        size,
        quantity,
        addedAt: serverTimestamp(),
      });
      setItems([...items, newItem]);
    }

    toast.success("Added to cart!");
  };

  // 수량 변경
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    const ref = doc(db, "cart", user.id, "items", itemId);
    await updateDoc(ref, { quantity });
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  };

  // 단일 삭제
  const removeItem = async (itemId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "cart", user.id, "items", itemId));
    setItems(items.filter((item) => item.id !== itemId));
  };

  // 선택 삭제
  const removeItems = async (itemIds: string[]) => {
    if (!user) return;
    await Promise.all(
      itemIds.map((id) => deleteDoc(doc(db, "cart", user.id, "items", id))),
    );
    setItems(items.filter((item) => !itemIds.includes(item.id)));
  };

  // 전체 삭제
  const clearCart = async () => {
    if (!user) return;
    await Promise.all(
      items.map((item) =>
        deleteDoc(doc(db, "cart", user.id, "items", item.id)),
      ),
    );
    setItems([]);
  };

  // 선택 상품 총액
  const getSubtotal = (selectedIds: string[]) => {
    return items
      .filter((item) => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  return {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    removeItems,
    clearCart,
    getSubtotal,
  };
}
