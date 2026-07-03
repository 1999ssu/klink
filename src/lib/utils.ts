// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

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
