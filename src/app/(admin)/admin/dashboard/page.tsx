// src/app/(admin)/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalMembers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const [
          totalProductsSnap,
          activeProductsSnap,
          totalOrdersSnap,
          pendingOrdersSnap,
          totalMembersSnap,
        ] = await Promise.all([
          getCountFromServer(collection(db, "products")),
          getCountFromServer(
            query(collection(db, "products"), where("status", "==", "active")),
          ),
          getCountFromServer(collection(db, "orders")),
          getCountFromServer(
            query(collection(db, "orders"), where("status", "==", "paid")),
          ),
          getCountFromServer(
            query(collection(db, "users"), where("role", "==", "customer")),
          ),
        ]);

        if (cancelled) return;

        setStats({
          totalProducts: totalProductsSnap.data().count,
          activeProducts: activeProductsSnap.data().count,
          totalOrders: totalOrdersSnap.data().count,
          pendingOrders: pendingOrdersSnap.data().count,
          totalMembers: totalMembersSnap.data().count,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Products",
      value: stats?.totalProducts ?? 0,
      sub: `${stats?.activeProducts ?? 0} active`,
      icon: Package,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      sub: `${stats?.pendingOrders ?? 0} awaiting action`,
      icon: ShoppingBag,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Members",
      value: stats?.totalMembers ?? 0,
      sub: "registered customers",
      icon: Users,
      color: "text-green-600 bg-green-50",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "—" : value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
              <div className={`p-2.5 rounded-sm ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 바로가기 */}
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/products/new"
            className="btn-primary text-sm py-2 px-4"
          >
            + Add Product
          </a>
          <a
            href="/admin/products/crawl"
            className="btn-outline text-sm py-2 px-4"
          >
            Crawl from Musinsa
          </a>
          <a href="/admin/orders" className="btn-outline text-sm py-2 px-4">
            View Orders
          </a>
        </div>
      </div>
    </div>
  );
}
