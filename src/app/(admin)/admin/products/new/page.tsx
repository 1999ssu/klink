// src/app/(admin)/admin/products/new/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import ProductForm from "@/components/admin/products/ProductForm";

// 크롤링 페이지에서 넘어온 파라미터로 초기값 세팅
export default function NewProductPage() {
  const searchParams = useSearchParams();

  const prefill = {
    name: searchParams.get("name") ?? "",
    brand: searchParams.get("brand") ?? "",
    originalPrice: Number(searchParams.get("originalPrice")) || 0,
    musinsaUrl: searchParams.get("musinsaUrl") ?? "",
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <ProductForm prefill={prefill} />
    </div>
  );
}
