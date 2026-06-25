// src/components/shared/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean; // true면 관리자만 접근 가능
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: Props) {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (requireAdmin && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, requireAdmin, router]);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 미인증 또는 권한 없음 → useEffect에서 redirect 처리
  if (!user || (requireAdmin && user.role !== "admin")) return null;

  return <>{children}</>;
}
