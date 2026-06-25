// src/components/shared/AuthProvider.tsx
"use client";

import { useAuthListener } from "@/hooks/useAuth";

// layout.tsx에서 감싸서 앱 전체에 auth 상태를 주입하는 컴포넌트
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthListener(); // 앱 시작 시 Firebase auth 상태 감지
  return <>{children}</>;
}
