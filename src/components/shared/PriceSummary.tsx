// src/components/shared/PriceSummary.tsx
// cart, checkout, order에서 반복되는 금액 요약 UI

interface PriceRow {
  label: string;
  value: string | number;
  bold?: boolean;
  note?: string; // "Calculated at checkout" 같은 부가 설명
}

interface Props {
  rows: PriceRow[];
  className?: string;
}

export default function PriceSummary({ rows, className = "" }: Props) {
  return (
    <div className={`space-y-3 text-sm text-gray-600 ${className}`}>
      {rows.map((row, i) => (
        <div
          key={i}
          className={`flex justify-between
            ${row.bold ? "font-bold text-gray-900 pt-3 border-t border-gray-200" : ""}`}
        >
          <span>{row.label}</span>
          {row.note ? (
            <span className="text-gray-400">{row.note}</span>
          ) : (
            <span className={row.bold ? "" : "font-medium text-gray-900"}>
              {typeof row.value === "number"
                ? `$${row.value.toFixed(2)} CAD`
                : row.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
