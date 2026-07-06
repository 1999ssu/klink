// src/components/shared/QuantityControl.tsx
// cart, product detail에서 반복되는 수량 조절 버튼

import { Minus, Plus } from "lucide-react";

interface Props {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  size?: "sm" | "md";
}

export default function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  size = "md",
}: Props) {
  const btnClass = size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2";

  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div className="flex items-center border border-gray-300">
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`${btnClass} hover:bg-gray-50 transition-colors 
                   disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        <Minus size={iconSize} />
      </button>
      <span
        className={`${btnClass} text-sm font-medium border-x border-gray-300 
                        min-w-[40px] text-center`}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className={`${btnClass} hover:bg-gray-50 transition-colors`}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}
