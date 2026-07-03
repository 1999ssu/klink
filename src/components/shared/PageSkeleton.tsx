// src/components/shared/PageSkeleton.tsx
// 반복되는 스켈레톤 패턴

interface Props {
  rows?: number;
  height?: string;
}

export default function PageSkeleton({ rows = 5, height = "h-20" }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} bg-gray-200 animate-pulse`} />
      ))}
    </div>
  );
}
