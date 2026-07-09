// src/app/(admin)/admin/products/page.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Product, ProductStatus } from "@/types";
import { useCollection } from "@/hooks/useFirestore";
import { Plus, Edit2, Eye, EyeOff, Search, Trash2 } from "lucide-react";
import PageSkeleton from "@/components/shared/PageSkeleton";
import toast from "react-hot-toast";
import { deleteDocById } from "@/lib/firestore-crud";
import { deleteObject, ref } from "firebase/storage";

const STATUS_BADGE: Record<ProductStatus, string> = {
  active: "bg-green-100 text-green-700",
  sold_out: "bg-yellow-100 text-yellow-700",
  hidden: "bg-gray-100 text-gray-500",
};

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [overrides, setOverrides] = useState<Record<string, Partial<Product>>>(
    {},
  );

  // useCollection으로 상품 fetch
  const { data: fetchedProducts, loading } = useCollection<Product>(
    "products",
    {
      constraints: [orderBy("createdAt", "desc")],
    },
  );

  // Firestore 업데이트 후 로컬 즉시 반영
  const products = fetchedProducts.map((p) =>
    overrides[p.id] ? { ...p, ...overrides[p.id] } : p,
  );

  // 검색 필터
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [search, products]);

  // 노출/숨김 토글
  const toggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus =
      product.status === "active" ? "hidden" : "active";
    await updateDoc(doc(db, "products", product.id), { status: nextStatus });
    setOverrides((prev) => ({
      ...prev,
      [product.id]: { status: nextStatus },
    }));
    toast.success(`Product ${nextStatus === "active" ? "visible" : "hidden"}.`);
  };

  const deleteProduct = async (product: Product) => {
    if (
      !confirm(
        `"${product.name}" 상품을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      )
    )
      return;

    try {
      // Storage 이미지 삭제
      await Promise.all(
        product.images.map(async (url) => {
          try {
            if (url.startsWith("https://firebasestorage")) {
              await deleteObject(ref(storage, url));
            }
          } catch {
            // 이미지 없어도 무시
          }
        }),
      );

      // Firestore 문서 삭제
      await deleteDocById("products", product.id);

      // 로컬 상태에서도 제거
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });

      toast.success("Product deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/products/crawl"
            className="btn-outline text-sm py-2 px-4"
          >
            Crawl from Musinsa
          </Link>
          <Link
            href="/admin/products/new"
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
          >
            <Plus size={14} />
            Add Product
          </Link>
        </div>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or brand..."
          className="input-base pl-9 max-w-sm"
        />
      </div>

      {/* 상품 테이블 */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Product", "Category", "Price", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider
                    ${h === "Actions" ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-3">
                  <PageSkeleton rows={5} height="h-5" />
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 상품명 + 이미지 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-12 bg-gray-100 flex-shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center 
                                          text-gray-300 text-[10px]"
                          >
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">{product.brand}</p>
                      </div>
                    </div>
                  </td>

                  {/* 카테고리 */}
                  <td className="px-4 py-3 text-gray-500 capitalize">
                    {product.category} / {product.subcategory}
                  </td>

                  {/* 가격 */}
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>

                  {/* 상태 */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 ${STATUS_BADGE[product.status]}`}
                    >
                      {product.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>

                  {/* 액션 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* 노출/숨김 */}
                      <button
                        onClick={() => toggleStatus(product)}
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                        title={
                          product.status === "active"
                            ? "Hide product"
                            : "Show product"
                        }
                      >
                        {product.status === "active" ? (
                          <Eye size={15} />
                        ) : (
                          <EyeOff size={15} />
                        )}
                      </button>

                      {/* 수정 */}
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                        title="Edit product"
                      >
                        <Edit2 size={15} />
                      </Link>

                      {/* 삭제 */}
                      <button
                        onClick={() => deleteProduct(product)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>No products found.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">{filtered.length} products</p>
    </div>
  );
}
