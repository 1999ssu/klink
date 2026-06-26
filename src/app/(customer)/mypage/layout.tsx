// src/app/(customer)/mypage/layout.tsx
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import MypageNav from "@/components/customer/mypage/MypageNav";

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">
          My Account
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* 사이드 네비 */}
          <aside className="md:w-48 flex-shrink-0">
            <MypageNav />
          </aside>
          {/* 콘텐츠 */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
