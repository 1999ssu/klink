// src/components/shared/EmptyState.tsx
// 빈 상태 UI — cart, wish, orders 등 여러 곳에서 반복

import Link from "next/link";

interface Props {
  message: string;
  submessage?: string;
  linkLabel?: string;
  linkHref?: string;
}

export default function EmptyState({
  message,
  submessage,
  linkLabel,
  linkHref,
}: Props) {
  return (
    <div className="text-center py-24 text-gray-400">
      <p className="text-lg font-medium">{message}</p>
      {submessage && <p className="text-sm mt-1">{submessage}</p>}
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="mt-4 inline-block text-primary text-sm hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
