// src/app/(customer)/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { Heart, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToCart } = useCart();
  const { isWished, toggleWish } = useWishlist(id);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          router.replace("/products");
          return;
        }
        const data = {
          id: snap.id,
          ...snap.data(),
          createdAt: snap.data().createdAt?.toDate(),
          updatedAt: snap.data().updatedAt?.toDate(),
        } as Product;
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart.");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (!product) return;
    await addToCart(product, selectedSize, quantity);
  };

  const handleWish = async () => {
    if (!user) {
      toast.error("Please sign in to save items.");
      return;
    }
    if (product) await toggleWish(product);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-gray-200" />
          <div className="space-y-4">
            <div className="h-5 bg-gray-200 w-24" />
            <div className="h-8 bg-gray-200 w-3/4" />
            <div className="h-6 bg-gray-200 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isSoldOut = product.status === "sold_out";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 이미지 갤러리 */}
        <div className="space-y-3">
          {/* 메인 이미지 */}
          <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
            {product.images[currentImg] ? (
              <Image
                src={product.images[currentImg]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                No Image
              </div>
            )}

            {/* 이미지 이전/다음 버튼 */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImg(
                      (p) =>
                        (p - 1 + product.images.length) % product.images.length,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImg((p) => (p + 1) % product.images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* 썸네일 */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`relative w-16 h-20 flex-shrink-0 border-2 transition-colors
                    ${i === currentImg ? "border-primary" : "border-transparent"}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          {/* 브랜드 + 이름 */}
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
              {product.brand}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* 가격 */}
          <p className="text-2xl font-semibold text-gray-900">
            ${product.price.toFixed(2)}{" "}
            <span className="text-sm font-normal text-gray-400">CAD</span>
          </p>

          {/* 사이즈 선택 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Size{" "}
              <span className="text-xs text-gray-400 font-normal">
                (North American sizing)
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const outOfStock = s.stock === 0;
                return (
                  <button
                    key={s.label}
                    onClick={() => !outOfStock && setSelectedSize(s.label)}
                    disabled={outOfStock || isSoldOut}
                    className={`
                      min-w-[44px] px-3 py-2 text-sm border transition-colors duration-150
                      ${
                        selectedSize === s.label
                          ? "border-primary bg-primary text-white"
                          : outOfStock || isSoldOut
                            ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                            : "border-gray-300 text-gray-700 hover:border-primary"
                      }
                    `}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 수량 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center border border-gray-300 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-5 py-2 text-sm font-medium border-x border-gray-300 min-w-[48px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSoldOut ? "Sold Out" : "Add to Cart"}
            </button>
            <button
              onClick={handleWish}
              className={`border px-4 py-3 transition-colors duration-150
                ${
                  isWished
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              aria-label="Wishlist"
            >
              <Heart size={18} className={isWished ? "fill-white" : ""} />
            </button>
          </div>

          {/* 반품 정책 경고 */}
          <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 leading-relaxed">
            ⚠️ <strong>No Returns or Exchanges.</strong> As an international
            intermediary, all sales are final. Please check sizing carefully
            before ordering.
          </div>

          {/* 상품 설명 */}
          {product.description && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Product Details
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
