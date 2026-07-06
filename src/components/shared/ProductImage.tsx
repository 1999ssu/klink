// src/components/shared/ProductImage.tsx
// ProductCard, OrderCard, CartPage, WishPage 등에서
// 반복되는 상품 이미지 + No Image 패턴

import Image from "next/image";

interface Props {
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export default function ProductImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "object-cover",
  sizes,
  priority = false,
}: Props) {
  if (!src) {
    return (
      <div
        className="w-full h-full flex items-center justify-center 
                      bg-gray-100 text-gray-300 text-xs"
      >
        No Image
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
