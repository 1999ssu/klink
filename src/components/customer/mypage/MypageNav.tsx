// src/components/customer/mypage/MypageNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, MapPin, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  { label: "My Orders", href: "/mypage/orders", icon: ShoppingBag },
  { label: "Address Book", href: "/mypage/addresses", icon: MapPin },
];

export default function MypageNav() {
  const pathname = usePathname();
  const { logOut } = useAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    await logOut();
    toast.success("Signed out successfully.");
    router.push("/");
  };

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
            ${
              pathname === href
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-cream hover:text-primary"
            }`}
        >
          <Icon size={16} />
          {label}
        </Link>
      ))}

      {/* 로그아웃 */}
      <button
        onClick={handleLogOut}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium 
                   text-gray-600 hover:bg-cream hover:text-primary transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </nav>
  );
}
