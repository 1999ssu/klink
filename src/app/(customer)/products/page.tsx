// src/app/(customer)/products/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { where, orderBy } from "firebase/firestore";
import { Product, ProductCategory, ProductSubcategory } from "@/types";
import { useCollection } from "@/hooks/useFirestore";
import ProductCard from "@/components/customer/product/ProductCard";
import ProductCardSkeleton from "@/components/customer/product/ProductCardSkeleton";
import ProductFilters from "@/components/customer/product/ProductFilters";
import EmptyState from "@/components/shared/EmptyState";
import { SlidersHorizontal, X } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") as ProductCategory | null;
  const subcategory = searchParams.get(
    "subcategory",
  ) as ProductSubcategory | null;

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">(
    "newest",
  );

  const sortConstraint =
    sortBy === "price_asc"
      ? orderBy("price", "asc")
      : sortBy === "price_desc"
        ? orderBy("price", "desc")
        : orderBy("createdAt", "desc");

  const { data: products, loading } = useCollection<Product>("products", {
    constraints: [
      where("status", "!=", "hidden"),
      ...(category ? [where("category", "==", category)] : []),
      ...(subcategory ? [where("subcategory", "==", subcategory)] : []),
      sortConstraint,
    ],
  });

  const pageTitle = subcategory
    ? `${category?.toUpperCase()} / ${subcategory.toUpperCase()}`
    : category
      ? category.toUpperCase()
      : "ALL PRODUCTS";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 px-3 py-2 bg-white 
                       focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

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
        <aside
          className={`md:block w-56 flex-shrink-0 ${showFilters ? "block" : "hidden"}`}
        >
          <ProductFilters
            currentCategory={category}
            currentSubcategory={subcategory}
          />
        </aside>

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
            <EmptyState
              message="No products found."
              submessage="Try a different category or check back later."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
