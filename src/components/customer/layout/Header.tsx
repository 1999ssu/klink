// src/components/customer/layout/Header.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

// 카테고리 데이터 구조
const CATEGORIES = [
  {
    label: "Men",
    value: "men",
    subcategories: [
      { label: "Tops", value: "tops" },
      { label: "Pants", value: "pants" },
      { label: "Outerwear", value: "outerwear" },
      { label: "Shoes", value: "shoes" },
      { label: "Hats", value: "hats" },
      { label: "Accessories", value: "accessories" },
    ],
  },
  {
    label: "Women",
    value: "women",
    subcategories: [
      { label: "Tops", value: "tops" },
      { label: "Pants", value: "pants" },
      { label: "Skirts", value: "skirts" },
      { label: "Dresses", value: "dresses" },
      { label: "Outerwear", value: "outerwear" },
      { label: "Shoes", value: "shoes" },
      { label: "Hats", value: "hats" },
      { label: "Accessories", value: "accessories" },
    ],
  },
  {
    label: "Unisex",
    value: "unisex",
    subcategories: [
      { label: "Tops", value: "tops" },
      { label: "Pants", value: "pants" },
      { label: "Outerwear", value: "outerwear" },
      { label: "Shoes", value: "shoes" },
      { label: "Accessories", value: "accessories" },
    ],
  },
] as const;

export default function Header() {
  const { user, logOut } = useAuth();
  const { totalCount } = useCartStore();
  const router = useRouter();

  const [openCategory, setOpenCategory] = useState<string | null>(null); // 열린 카테고리
  const [openMyPage, setOpenMyPage] = useState(false); // 마이페이지 드롭다운
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 모바일 메뉴

  const myPageRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 마이페이지 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (myPageRef.current && !myPageRef.current.contains(e.target as Node)) {
        setOpenMyPage(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = async () => {
    await logOut();
    setOpenMyPage(false);
    toast.success("Signed out successfully.");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link
            href="/"
            className="font-display text-2xl font-bold text-primary tracking-tight flex-shrink-0"
          >
            KStyle CA
          </Link>

          {/* 데스크탑 카테고리 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.value}
                className="relative"
                onMouseEnter={() => setOpenCategory(cat.value)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <Link
                  href={`/products?category=${cat.value}`}
                  className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-gray-700 
                             hover:text-primary transition-colors duration-150"
                >
                  {cat.label}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 
                    ${openCategory === cat.value ? "rotate-180" : ""}`}
                  />
                </Link>

                {/* 서브카테고리 드롭다운 */}
                {openCategory === cat.value && (
                  <div
                    className="absolute top-full left-0 bg-white border border-gray-200 
                                  shadow-lg min-w-[160px] py-2 z-50"
                  >
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.value}
                        href={`/products?category=${cat.value}&subcategory=${sub.value}`}
                        className="block px-5 py-2.5 text-sm text-gray-600 hover:text-primary 
                                   hover:bg-cream transition-colors duration-150"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 우측 아이콘 영역 */}
          <div className="flex items-center gap-1">
            {/* 위시리스트 */}
            <Link
              href="/wish"
              className="p-2.5 text-gray-600 hover:text-primary transition-colors duration-150"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>

            {/* 장바구니 */}
            <Link
              href="/cart"
              className="relative p-2.5 text-gray-600 hover:text-primary transition-colors duration-150"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {totalCount() > 0 && (
                <span
                  className="absolute top-1 right-1 bg-primary text-white text-[10px] 
                                 font-bold rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {totalCount() > 99 ? "99+" : totalCount()}
                </span>
              )}
            </Link>

            {/* 마이페이지 or 로그인 */}
            {user ? (
              <div ref={myPageRef} className="relative">
                <button
                  onClick={() => setOpenMyPage((prev) => !prev)}
                  className="p-2.5 text-gray-600 hover:text-primary transition-colors duration-150"
                  aria-label="My Page"
                >
                  <User size={20} />
                </button>

                {/* 마이페이지 아코디언 드롭다운 */}
                {openMyPage && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 
                                  shadow-lg min-w-[180px] z-50"
                  >
                    {/* 유저 정보 */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user.name}
                      </p>
                    </div>

                    <Link
                      href="/mypage/orders"
                      onClick={() => setOpenMyPage(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-cream 
                                 hover:text-primary transition-colors duration-150"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/mypage/addresses"
                      onClick={() => setOpenMyPage(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-cream 
                                 hover:text-primary transition-colors duration-150"
                    >
                      Address Book
                    </Link>

                    {/* 관리자 메뉴 (admin만 보임) */}
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setOpenMyPage(false)}
                        className="block px-4 py-3 text-sm text-primary font-medium hover:bg-cream 
                                   transition-colors duration-150 border-t border-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogOut}
                      className="w-full text-left px-4 py-3 text-sm text-gray-500 
                                 hover:bg-cream hover:text-primary transition-colors duration-150 
                                 border-t border-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-1 px-4 py-2 text-sm font-medium text-primary border border-primary 
                           hover:bg-primary hover:text-white transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {/* 모바일 햄버거 */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2.5 text-gray-600 hover:text-primary ml-1"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {CATEGORIES.map((cat) => (
            <div key={cat.value}>
              <button
                onClick={() =>
                  setOpenCategory(openCategory === cat.value ? null : cat.value)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-sm 
                           font-medium text-gray-700 hover:text-primary"
              >
                {cat.label}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 
                    ${openCategory === cat.value ? "rotate-180" : ""}`}
                />
              </button>

              {openCategory === cat.value && (
                <div className="bg-cream">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.value}
                      href={`/products?category=${cat.value}&subcategory=${sub.value}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-8 py-2.5 text-sm text-gray-600 hover:text-primary"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
