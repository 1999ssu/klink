// src/app/(admin)/admin/products/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product, ProductStatus } from "@/types";
import { Plus, Edit2, Eye, EyeOff, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  // const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        if (cancelled) return;
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Product[];
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // 검색 필터
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
    );
  }, [search, products]);

  // 상태 빠른 변경
  const toggleStatus = async (product: Product) => {
    const nextStatus: ProductStatus =
      product.status === "active" ? "hidden" : "active";
    await updateDoc(doc(db, "products", product.id), { status: nextStatus });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p)),
    );
    toast.success(`Product ${nextStatus === "active" ? "visible" : "hidden"}.`);
  };

  const STATUS_BADGE: Record<ProductStatus, string> = {
    active: "bg-green-100 text-green-700",
    sold_out: "bg-yellow-100 text-yellow-700",
    hidden: "bg-gray-100 text-gray-500",
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-5 bg-gray-200 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              : filtered.map((product) => (
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
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                              No Img
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 capitalize">
                      {product.category} / {product.subcategory}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 ${STATUS_BADGE[product.status]}`}
                      >
                        {product.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* 노출/숨김 토글 */}
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
                      </div>
                    </td>
                  </tr>
                ))}
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
