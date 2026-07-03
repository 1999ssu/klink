// src/app/(admin)/admin/members/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus, User, Address } from "@/types";
import { formatDate } from "@/lib/utils";
import StatusBadge from "@/components/shared/StatusBadge";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface MemberWithOrders extends User {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<MemberWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [memberOrders, setMemberOrders] = useState<Record<string, Order[]>>({});

  useEffect(() => {
    let cancelled = false;

    const fetchMembers = async () => {
      try {
        const usersSnap = await getDocs(
          query(
            collection(db, "users"),
            where("role", "==", "customer"),
            orderBy("createdAt", "desc"),
          ),
        );
        if (cancelled) return;

        const users = usersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as User[];

        const ordersSnap = await getDocs(
          query(collection(db, "orders"), orderBy("createdAt", "desc")),
        );
        if (cancelled) return;

        const allOrders = ordersSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Order[];

        const ordersByUser: Record<string, Order[]> = {};
        allOrders.forEach((order) => {
          if (!ordersByUser[order.userId]) ordersByUser[order.userId] = [];
          ordersByUser[order.userId].push(order);
        });

        setMemberOrders(ordersByUser);

        const membersWithOrders: MemberWithOrders[] = users.map((user) => {
          const orders = ordersByUser[user.id] ?? [];
          const active = orders.filter((o) => o.status !== "cancelled");
          return {
            ...user,
            orderCount: active.length,
            totalSpent: active.reduce((sum, o) => sum + o.total, 0),
            lastOrderAt: orders[0]?.createdAt ?? null,
          };
        });

        setMembers(membersWithOrders);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMembers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
    );
  }, [search, members]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-sm text-gray-400">{filtered.length} customers</p>
      </div>

      <div className="relative mb-5">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-base pl-9 max-w-sm text-sm"
        />
      </div>

      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {[
                "Member",
                "Joined",
                "Orders",
                "Total Spent",
                "Last Order",
                "Detail",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider
                    ${h === "Detail" ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-3">
                  <PageSkeleton rows={5} height="h-5" />
                </td>
              </tr>
            ) : (
              filtered.map((member) => (
                <>
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {member.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${member.totalSpent.toFixed(2)} CAD
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {member.lastOrderAt
                        ? formatDate(member.lastOrderAt)
                        : "No orders"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          setExpandedId(
                            expandedId === member.id ? null : member.id,
                          )
                        }
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                      >
                        {expandedId === member.id ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </button>
                    </td>
                  </tr>

                  {expandedId === member.id && (
                    <tr key={`${member.id}-detail`}>
                      <td
                        colSpan={6}
                        className="bg-gray-50 px-6 py-4 border-t border-gray-100"
                      >
                        <MemberOrderDetail
                          orders={memberOrders[member.id] ?? []}
                          addresses={member.addresses}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No members found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberOrderDetail({
  orders,
  addresses,
}: {
  orders: Order[];
  addresses: Address[];
}) {
  return (
    <div className="space-y-5">
      {/* 저장된 주소 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Saved Addresses ({addresses.length})
        </h3>
        {addresses.length === 0 ? (
          <p className="text-xs text-gray-400">No saved addresses.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`text-xs border p-3 min-w-[200px]
                  ${addr.isDefault ? "border-primary bg-cream" : "border-gray-200 bg-white"}`}
              >
                {addr.isDefault && (
                  <p className="text-[10px] text-primary font-semibold mb-1">
                    DEFAULT
                  </p>
                )}
                <p className="font-medium text-gray-800">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-gray-500">{addr.street}</p>
                <p className="text-gray-500">
                  {addr.city}, {addr.province} {addr.postalCode}
                </p>
                <p className="text-gray-400">{addr.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 주문 내역 */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Order History ({orders.length})
        </h3>
        {orders.length === 0 ? (
          <p className="text-xs text-gray-400">No orders yet.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 px-4 py-3 
                           flex flex-wrap items-center gap-3 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-400">
                    #{order.id.slice(0, 12).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0">
                  {order.items.length} item(s)
                </p>
                <p className="font-semibold text-gray-900 flex-shrink-0">
                  ${order.total.toFixed(2)} CAD
                </p>
                <StatusBadge status={order.status} size="sm" />
                {order.shippingAddress && (
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    → {order.shippingAddress.city},{" "}
                    {order.shippingAddress.province}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
