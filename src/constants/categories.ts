// src/constants/categories.ts
// Header, ProductFilters에서 중복으로 선언하던 카테고리 데이터를 한 곳으로

import { ProductCategory, ProductSubcategory } from "@/types";

export interface Subcategory {
  label: string;
  value: ProductSubcategory;
}

export interface Category {
  label: string;
  value: ProductCategory;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
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
      //   { label: 'Skirts', value: 'skirts' },
      //   { label: 'Dresses', value: 'dresses' },
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
];
