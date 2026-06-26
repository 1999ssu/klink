// src/app/(customer)/mypage/page.tsx
import { redirect } from "next/navigation";

// /mypage 진입 시 /mypage/orders로 자동 이동
export default function MypagePage() {
  redirect("/mypage/orders");
}
