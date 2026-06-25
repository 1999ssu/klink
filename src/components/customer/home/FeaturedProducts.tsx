// src/components/customer/home/FeaturedProducts.tsx
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import ProductCard from "@/components/customer/product/ProductCard";
import ProductCardSkeleton from "@/components/customer/product/ProductCardSkeleton";
import Link from "next/link";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("status", "==", "active"),
          orderBy("createdAt", "desc"),
          limit(6),
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[];
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      {/* 섹션 헤더 */}
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

      {/* 상품 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {/* 상품이 없을 때 */}
      {!loading && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No products yet.</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      )}
    </section>
  );
}
