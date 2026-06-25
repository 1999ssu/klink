// src/app/(customer)/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductCategory, ProductSubcategory } from "@/types";
import ProductCard from "@/components/customer/product/ProductCard";
import ProductCardSkeleton from "@/components/customer/product/ProductCardSkeleton";
import ProductFilters from "@/components/customer/product/ProductFilters";
import { SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as ProductCategory | null;
  const subcategory = searchParams.get(
    "subcategory",
  ) as ProductSubcategory | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // 정렬 옵션
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    "newest",
  );

  useEffect(() => {
    let cancelled = false; // 언마운트 시 setState 방지 (클린업)

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const constraints: QueryConstraint[] = [
          where("status", "!=", "hidden"),
        ];

        if (category) constraints.push(where("category", "==", category));
        if (subcategory)
          constraints.push(where("subcategory", "==", subcategory));

        if (sortBy === "newest") constraints.push(orderBy("createdAt", "desc"));
        else if (sortBy === "price_asc")
          constraints.push(orderBy("price", "asc"));
        else if (sortBy === "price_desc")
          constraints.push(orderBy("price", "desc"));

        const q = query(collection(db, "products"), ...constraints);
        const snapshot = await getDocs(q);

        if (cancelled) return; // 언마운트됐으면 setState 스킵

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[];

        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true; // 클린업: 언마운트 or deps 변경 시
    };
  }, [category, subcategory, sortBy]); // useCallback 제거하고 deps 직접 명시

  // 페이지 타이틀
  const pageTitle = subcategory
    ? `${category?.toUpperCase()} / ${subcategory.toUpperCase()}`
    : category
      ? category.toUpperCase()
      : "ALL PRODUCTS";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">
            {pageTitle}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-400 mt-1">
              {products.length} items
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* 정렬 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 px-3 py-2 bg-white focus:outline-none 
                       focus:border-primary cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* 필터 토글 (모바일) */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="md:hidden flex items-center gap-1.5 text-sm border border-gray-300 
                       px-3 py-2 hover:border-primary transition-colors"
          >
            {showFilters ? <X size={14} /> : <SlidersHorizontal size={14} />}
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* 필터 사이드바 */}
        <aside
          className={`
          md:block w-56 flex-shrink-0
          ${showFilters ? "block" : "hidden"}
        `}
        >
          <ProductFilters
            currentCategory={category}
            currentSubcategory={subcategory}
          />
        </aside>

        {/* 상품 그리드 */}
        <div className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-medium">No products found.</p>
              <p className="text-sm mt-1">
                Try a different category or check back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
