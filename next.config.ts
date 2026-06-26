// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Firebase Storage 이미지
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        // 무신사 이미지 (직접 업로드한 경우 대비)
        protocol: "https",
        hostname: "image.musinsa.com",
      },
    ],
  },
};

export default nextConfig;
