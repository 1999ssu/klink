// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { Product } from "@/types";

// Tailwind 클래스 병합
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷
export function formatDate(
  date: Date | null | undefined,
  pattern = "MMM d, yyyy",
) {
  if (!date) return "—";
  return format(date, pattern);
}

// 날짜 + 시간 포맷
export function formatDateTime(date: Date | null | undefined) {
  return formatDate(date, "MMM d, yyyy · h:mm a");
}

// Firestore Timestamp 타입
type TimestampLike = {
  toDate: () => Date;
};

// timestamps 포함 타입 (확장 가능)
type WithTimestamps = {
  createdAt?: unknown;
  updatedAt?: unknown;
};

// Firestore 문서 → Date 변환 유틸
export function convertTimestamps<T extends WithTimestamps>(data: T): T {
  const result = { ...data };

  (["createdAt", "updatedAt"] as const).forEach((key) => {
    const value = result[key];

    if (
      value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof (value as any).toDate === "function"
    ) {
      result[key] = (value as TimestampLike).toDate() as T[typeof key];
    }
  });

  return result;
}

// 가격 포맷 (CAD 기준)
export function formatPrice(price: number) {
  return `$${price.toFixed(2)} CAD`;
}

// 상품이 구매 가능한 상태인지 확인
export function isProductAvailable(product: Product, size?: string): boolean {
  if (product.status === "hidden") return false;
  if (product.status === "sold_out") return false;
  if (size) {
    const sizeInfo = product.sizes.find((s) => s.label === size);
    if (!sizeInfo || sizeInfo.stock === 0) return false;
  }
  return true;
}

// 상품 비활성화 사유 텍스트
export function getUnavailableReason(product: Product, size?: string): string {
  if (product.status === "hidden") return "This item is no longer available.";
  if (product.status === "sold_out") return "This item is sold out.";
  if (size) {
    const sizeInfo = product.sizes.find((s) => s.label === size);
    if (!sizeInfo || sizeInfo.stock === 0)
      return "Selected size is out of stock.";
  }
  return "";
}
