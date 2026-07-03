// src/app/(admin)/admin/orders/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_FLOW, ALL_ORDER_STATUSES } from "@/constants/order";
import StatusBadge from "@/components/shared/StatusBadge";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
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
  }, []);

  // useMemo로 필터링
  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.userEmail.toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
      toast.success(`Order status updated to "${nextStatus}".`);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Cancel this order?")) return;
    await updateStatus(orderId, "cancelled");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-400">{filtered.length} orders</p>
      </div>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or order ID..."
            className="input-base pl-9 w-72 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`text-xs px-3 py-1.5 border transition-colors
              ${
                statusFilter === "all"
                  ? "bg-primary text-white border-primary"
                  : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
              }`}
          >
            All
          </button>
          {ALL_ORDER_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 border transition-colors capitalize
                ${
                  statusFilter === s
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* 주문 목록 */}
      <div className="space-y-3">
        {loading ? (
          <PageSkeleton rows={5} height="h-20" />
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200">
              <div className="px-5 py-4 flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-mono text-gray-400">
                    #{order.id.slice(0, 12).toUpperCase()}
                  </p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">
                    {order.userEmail}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                  ${order.total.toFixed(2)} CAD
                </p>

                <StatusBadge status={order.status} />

                <div className="flex items-center gap-2 flex-shrink-0">
                  {ORDER_STATUS_FLOW[order.status] && (
                    <button
                      onClick={() =>
                        updateStatus(order.id, ORDER_STATUS_FLOW[order.status]!)
                      }
                      className="text-xs px-3 py-1.5 bg-primary text-white 
                                 hover:bg-primary-dark transition-colors capitalize"
                    >
                      → {ORDER_STATUS_FLOW[order.status]?.replace("_", " ")}
                    </button>
                  )}
                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-500 
                                 hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                </div>

                <button
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  className="p-1.5 text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                >
                  {expandedId === order.id ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-5 bg-gray-50">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Items ({order.items.length})
                    </h3>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white border border-gray-200 p-3"
                        >
                          <div className="text-sm flex-1 min-w-0">
                            <p className="text-xs text-gray-400">
                              {item.brand}
                            </p>
                            <p className="font-medium text-gray-800 line-clamp-1">
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

                  <div className="grid grid-cols-2 gap-5">
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
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.province}{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          <p className="text-gray-400 text-xs">
                            {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Payment
                      </h3>
                      <div className="text-sm space-y-1.5 text-gray-600">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>${order.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div
                          className="flex justify-between font-bold text-gray-900 
                                        pt-1.5 border-t border-gray-200"
                        >
                          <span>Total</span>
                          <span>${order.total.toFixed(2)} CAD</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-gray-300 mt-3 break-all">
                        {order.stripePaymentIntentId}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p>No orders found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
