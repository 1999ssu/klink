// src/app/(admin)/admin/members/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { format } from "date-fns";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

// 회원별 주문 요약
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
        // 고객 전체 조회
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

        // 전체 주문 조회 후 유저별로 집계
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

        // 유저별 주문 맵 생성
        const ordersByUser: Record<string, Order[]> = {};
        allOrders.forEach((order) => {
          if (!ordersByUser[order.userId]) ordersByUser[order.userId] = [];
          ordersByUser[order.userId].push(order);
        });

        setMemberOrders(ordersByUser);

        // 회원 + 주문 통계 합치기
        const membersWithOrders: MemberWithOrders[] = users.map((user) => {
          const orders = ordersByUser[user.id] ?? [];
          const delivered = orders.filter((o) => o.status !== "cancelled");
          return {
            ...user,
            orderCount: delivered.length,
            totalSpent: delivered.reduce((sum, o) => sum + o.total, 0),
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

  // 검색 필터
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
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-sm text-gray-400">{filtered.length} customers</p>
      </div>

      {/* 검색 */}
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

      {/* 회원 테이블 */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Detail
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-5 bg-gray-200 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              : filtered.map((member) => (
                  <>
                    {/* 회원 행 */}
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400">{member.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {member.createdAt
                          ? format(member.createdAt, "MMM d, yyyy")
                          : "—"}
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
                          ? format(member.lastOrderAt, "MMM d, yyyy")
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

                    {/* 회원 주문 상세 (펼쳤을 때) */}
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
                ))}
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

// ── 회원 주문 상세 서브 컴포넌트 ─────────────────────────────
import { Order } from "@/types";
import { Address } from "@/types";

const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-500",
};

import { OrderStatus } from "@/types";

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
                {/* 주문 ID + 날짜 */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gray-400">
                    #{order.id.slice(0, 12).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.createdAt
                      ? format(order.createdAt, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>

                {/* 상품 수 */}
                <p className="text-xs text-gray-500 flex-shrink-0">
                  {order.items.length} item(s)
                </p>

                {/* 총액 */}
                <p className="font-semibold text-gray-900 flex-shrink-0">
                  ${order.total.toFixed(2)} CAD
                </p>

                {/* 상태 */}
                <span
                  className={`text-xs font-medium px-2 py-0.5 flex-shrink-0
                  ${ORDER_STATUS_BADGE[order.status]}`}
                >
                  {order.status.replace("_", " ").toUpperCase()}
                </span>

                {/* 배송지 요약 */}
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
