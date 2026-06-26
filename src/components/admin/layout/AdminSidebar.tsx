// src/components/admin/layout/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Members", href: "/admin/members", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    await logOut();
    toast.success("Signed out.");
    router.push("/");
  };

  return (
    <aside
      className="w-56 flex-shrink-0 bg-white border-r border-gray-200 
                      flex flex-col min-h-screen sticky top-0"
    >
      {/* 로고 */}
      <div className="px-6 py-5 border-b border-gray-200">
        <Link href="/admin/dashboard">
          <span className="font-display text-xl font-bold text-primary">
            KStyle CA
          </span>
          <span className="block text-xs text-gray-400 mt-0.5">Admin</span>
        </Link>
      </div>

      {/* 네비 */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium 
                        transition-colors rounded-sm
              ${
                pathname.startsWith(href)
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-primary"
              }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* 로그아웃 */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={handleLogOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium 
                     text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
