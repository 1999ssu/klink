// src/components/customer/product/ProductFilters.tsx
"use client";

import Link from "next/link";
import { ProductCategory, ProductSubcategory } from "@/types";
import { CATEGORIES } from "@/constants/categories";

interface Props {
  currentCategory: ProductCategory | null;
  currentSubcategory: ProductSubcategory | null;
}

export default function ProductFilters({
  currentCategory,
  currentSubcategory,
}: Props) {
  return (
    <div className="space-y-6">
      {/* 전체 보기 */}
      <Link
        href="/products"
        className={`block text-sm font-medium pb-3 border-b border-gray-200
          ${!currentCategory ? "text-primary" : "text-gray-700 hover:text-primary"}`}
      >
        All Products
      </Link>

      {CATEGORIES.map((group) => (
        <div key={group.value}>
          {/* 카테고리 */}
          <Link
            href={`/products?category=${group.value}`}
            className={`block text-sm font-semibold mb-2 uppercase tracking-wider
              ${
                currentCategory === group.value && !currentSubcategory
                  ? "text-primary"
                  : "text-gray-800 hover:text-primary"
              }`}
          >
            {group.label}
          </Link>

          {/* 서브카테고리 */}
          <ul className="space-y-1.5 pl-2">
            {group.subcategories.map((sub) => (
              <li key={sub.value}>
                <Link
                  href={`/products?category=${group.value}&subcategory=${sub.value}`}
                  className={`text-sm transition-colors duration-150
                    ${
                      currentCategory === group.value &&
                      currentSubcategory === sub.value
                        ? "text-primary font-medium"
                        : "text-gray-500 hover:text-primary"
                    }`}
                >
                  {sub.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
