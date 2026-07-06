// src/app/(customer)/mypage/orders/page.tsx
"use client";

import { where, orderBy } from "firebase/firestore";
import { useAuthStore } from "@/store/authStore";
import { Order } from "@/types";
import OrderCard from "@/components/customer/mypage/OrderCard";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useCollection } from "@/hooks/useFirestore";

export default function OrdersPage() {
  const { user } = useAuthStore();

  const { data: orders, loading } = useCollection<Order>("orders", {
    constraints: [
      where("userId", "==", user?.id ?? ""),
      orderBy("createdAt", "desc"),
    ],
    enabled: !!user, // user 없으면 fetch 안 함
  });

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
