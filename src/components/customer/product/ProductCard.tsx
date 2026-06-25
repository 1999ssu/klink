// src/components/customer/product/ProductCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Product } from "@/types";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { user } = useAuthStore();
  const { isWished, toggleWish } = useWishlist(product.id);
  const [imgError, setImgError] = useState(false);

  const handleWishClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link 이동 방지
    if (!user) {
      toast.error("Please sign in to save items.");
      return;
    }
    await toggleWish(product);
  };

  const isSoldOut = product.status === "sold_out";

  return (
    <Link href={`/products/${product.id}`} className="group block">
      {/* 이미지 */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {!imgError && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 
              group-hover:scale-105 ${isSoldOut ? "opacity-50" : ""}`}
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
        ) : (
          // 이미지 없을 때 placeholder
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 text-xs">No Image</span>
          </div>
        )}

        {/* 품절 뱃지 */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1.5">
              SOLD OUT
            </span>
          </div>
        )}

        {/* 위시리스트 버튼 */}
        <button
          onClick={handleWishClick}
          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white 
                     transition-colors duration-150 opacity-0 group-hover:opacity-100"
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            className={isWished ? "fill-primary text-primary" : "text-gray-600"}
          />
        </button>
      </div>

      {/* 상품 정보 */}
      <div className="mt-3 space-y-0.5">
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {product.brand}
        </p>
        <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">
          {product.name}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-1">
          ${product.price.toFixed(2)} CAD
        </p>
      </div>
    </Link>
  );
}
