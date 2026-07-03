// src/components/shared/StatusBadge.tsx
// 주문 상태 뱃지 — orders, mypage, members에서 중복 사용

import { OrderStatus } from "@/types";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/constants/order";

interface Props {
  status: OrderStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: Props) {
  return (
    <span
      className={`
      font-medium inline-block
      ${ORDER_STATUS_BADGE[status]}
      ${size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}
    `}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
