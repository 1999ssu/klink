// src/components/customer/product/ProductCardSkeleton.tsx
// 상품 카드 로딩 스켈레톤
export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-gray-200 w-16" />
        <div className="h-4 bg-gray-200 w-full" />
        <div className="h-4 bg-gray-200 w-3/4" />
        <div className="h-4 bg-gray-200 w-1/2 mt-1" />
      </div>
    </div>
  );
}
