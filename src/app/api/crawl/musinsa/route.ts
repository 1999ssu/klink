// src/app/api/crawl/musinsa/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { adminAuth } from "@/lib/firebase-admin";

// 크롤링 결과 타입
export interface CrawledProduct {
  name: string;
  brand: string;
  originalPrice: number; // KRW
  musinsaUrl: string;
  musinsaId: string;
}

export async function POST(req: NextRequest) {
  // 관리자 인증
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // Firestore에서 role 확인 (필요 시)
    // 여기서는 토큰 검증만으로 진행

    const { url } = await req.json();

    if (!url || !url.includes("musinsa.com")) {
      return NextResponse.json(
        { error: "Invalid Musinsa URL" },
        { status: 400 },
      );
    }

    // 상품 상세 페이지 크롤링
    const res = await fetch(url, {
      headers: {
        // 브라우저처럼 보이게 User-Agent 설정
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
        Referer: "https://www.musinsa.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${res.status}` },
        { status: 502 },
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 무신사 상품 상세 페이지 파싱 (텍스트만)
    const name =
      $('meta[property="og:title"]').attr("content") ||
      $("h1.product_title").text().trim() ||
      $(".product-title").text().trim();

    const brand =
      $(".product_article_contents .brand").text().trim() ||
      $('[class*="brand"]').first().text().trim() ||
      "";

    // 가격 파싱 (숫자만 추출)
    const priceRaw =
      $('meta[property="product:price:amount"]').attr("content") ||
      $(".sale_price").text().trim() ||
      $(".price").first().text().trim();

    const originalPrice = parseInt(priceRaw.replace(/[^0-9]/g, ""), 10) || 0;

    // 무신사 상품 ID (URL에서 추출)
    const musinsaIdMatch = url.match(/\/(\d+)\/?$/);
    const musinsaId = musinsaIdMatch?.[1] ?? "";

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Could not parse product info. The page structure may have changed.",
        },
        { status: 422 },
      );
    }

    const result: CrawledProduct = {
      name: name.trim(),
      brand: brand.trim(),
      originalPrice,
      musinsaUrl: url,
      musinsaId,
    };

    return NextResponse.json({ product: result });
  } catch (err) {
    console.error("Crawl error:", err);
    return NextResponse.json({ error: "Crawl failed" }, { status: 500 });
  }
}
