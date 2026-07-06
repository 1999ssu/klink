// src/app/(customer)/mypage/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Order } from "@/types";
import OrderCard from "@/components/customer/mypage/OrderCard";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.id),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        if (cancelled) return;

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Order[];

        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return <PageSkeleton rows={3} height="h-40" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        message="No orders yet."
        submessage="Your order history will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{orders.length} order(s) total</p>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
