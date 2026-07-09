// src/hooks/useCart.ts
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { CartItem, Product } from "@/types";
import {
  fetchSubCollection,
  setSubDoc,
  deleteSubDoc,
} from "@/lib/firestore-crud";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export function useCart() {
  const { user } = useAuthStore();
  const { items, setItems } = useCartStore();

  // 카트 불러오기 — productId로 최신 상품 정보 fetch
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        // 1. 카트 아이템 목록 (id, productId, size, quantity만 저장됨)
        const cartDocs = await fetchSubCollection<{
          id: string;
          productId: string;
          size: string;
          quantity: number;
        }>("cart", user.id, "items");

        if (cartDocs.length === 0) {
          setItems([]);
          return;
        }

        // 2. productId로 최신 상품 정보 fetch
        const productSnapshots = await Promise.all(
          cartDocs.map((item) => getDoc(doc(db, "products", item.productId))),
        );

        // 3. 카트 아이템 + 최신 상품 정보 합치기
        const cartItems: CartItem[] = cartDocs
          .map((item, i) => {
            const productSnap = productSnapshots[i];
            if (!productSnap.exists()) return null; // 삭제된 상품 제외

            const product = {
              id: productSnap.id,
              ...productSnap.data(),
              createdAt: productSnap.data().createdAt?.toDate(),
              updatedAt: productSnap.data().updatedAt?.toDate(),
            } as Product;

            return {
              id: item.id,
              productId: item.productId,
              product, // 항상 최신 상품 정보
              size: item.size,
              quantity: item.quantity,
            };
          })
          .filter(Boolean) as CartItem[];

        setItems(cartItems);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      }
    };

    fetchCart();
  }, [user, setItems]);

  // 카트 추가 — productId, size, quantity만 저장
  const addToCart = async (product: Product, size: string, quantity = 1) => {
    if (!user) {
      toast.error("Please sign in to add items to cart.");
      return;
    }

    const existing = items.find(
      (item) => item.productId === product.id && item.size === size,
    );

    if (existing) {
      await updateDoc(doc(db, "cart", user.id, "items", existing.id), {
        quantity: existing.quantity + quantity,
      });
      setItems(
        items.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        ),
      );
    } else {
      const newId = uuidv4();
      // productId, size, quantity만 저장 (product 객체 X)
      await setSubDoc("cart", user.id, "items", newId, {
        productId: product.id,
        size,
        quantity,
      });
      setItems([
        ...items,
        { id: newId, productId: product.id, product, size, quantity },
      ]);
    }

    toast.success("Added to cart!");
  };

  // 수량 변경
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    await updateDoc(doc(db, "cart", user.id, "items", itemId), { quantity });
    setItems(
      items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  };

  // 단일 삭제
  const removeItem = async (itemId: string) => {
    if (!user) return;
    await deleteSubDoc("cart", user.id, "items", itemId);
    setItems(items.filter((item) => item.id !== itemId));
  };

  // 선택 삭제
  const removeItems = async (itemIds: string[]) => {
    if (!user) return;
    await Promise.all(
      itemIds.map((id) => deleteSubDoc("cart", user.id, "items", id)),
    );
    setItems(items.filter((item) => !itemIds.includes(item.id)));
  };

  // 전체 삭제
  const clearCart = async () => {
    if (!user) return;
    await Promise.all(
      items.map((item) => deleteSubDoc("cart", user.id, "items", item.id)),
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
