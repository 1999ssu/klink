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
      {
        protocol: "https",
        hostname: "image.msscdn.net",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://js.stripe.com https://maps.googleapis.com https://maps.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "connect-src 'self' https://api.stripe.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com",
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://maps.gstatic.com https://maps.googleapis.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
