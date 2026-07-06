// src/components/customer/home/FeaturedProducts.tsx
"use client";

import { where, orderBy, limit } from "firebase/firestore";
import { Product } from "@/types";
import { useCollection } from "@/hooks/useFirestore";
import ProductCard from "@/components/customer/product/ProductCard";
import ProductCardSkeleton from "@/components/customer/product/ProductCardSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";

export default function FeaturedProducts() {
  const { data: products, loading } = useCollection<Product>("products", {
    constraints: [
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(6),
    ],
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">
            Just Arrived
          </p>
          <h2 className="font-display text-3xl font-bold text-gray-900">
            New In
          </h2>
        </div>
        <Link
          href="/products"
          className="text-sm text-primary font-medium hover:underline underline-offset-2"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {!loading && products.length === 0 && (
        <EmptyState message="No products yet." submessage="Check back soon!" />
      )}
    </section>
  );
}
