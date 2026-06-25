// src/components/customer/product/ProductFilters.tsx
"use client";

import Link from "next/link";
import { ProductCategory, ProductSubcategory } from "@/types";

const FILTER_DATA = [
  {
    category: "men" as ProductCategory,
    label: "Men",
    subcategories: [
      { value: "tops", label: "Tops" },
      { value: "pants", label: "Pants" },
      { value: "outerwear", label: "Outerwear" },
      { value: "shoes", label: "Shoes" },
      { value: "hats", label: "Hats" },
      { value: "accessories", label: "Accessories" },
    ],
  },
  {
    category: "women" as ProductCategory,
    label: "Women",
    subcategories: [
      { value: "tops", label: "Tops" },
      { value: "pants", label: "Pants" },
      { value: "skirts", label: "Skirts" },
      { value: "dresses", label: "Dresses" },
      { value: "outerwear", label: "Outerwear" },
      { value: "shoes", label: "Shoes" },
      { value: "hats", label: "Hats" },
      { value: "accessories", label: "Accessories" },
    ],
  },
  {
    category: "unisex" as ProductCategory,
    label: "Unisex",
    subcategories: [
      { value: "tops", label: "Tops" },
      { value: "pants", label: "Pants" },
      { value: "outerwear", label: "Outerwear" },
      { value: "shoes", label: "Shoes" },
      { value: "accessories", label: "Accessories" },
    ],
  },
];

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

      {FILTER_DATA.map((group) => (
        <div key={group.category}>
          {/* 카테고리 */}
          <Link
            href={`/products?category=${group.category}`}
            className={`block text-sm font-semibold mb-2 uppercase tracking-wider
              ${
                currentCategory === group.category && !currentSubcategory
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
                  href={`/products?category=${group.category}&subcategory=${sub.value}`}
                  className={`text-sm transition-colors duration-150
                    ${
                      currentCategory === group.category &&
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
