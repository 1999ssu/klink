// src/app/(admin)/admin/products/crawl/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { CrawledProduct } from "@/app/api/crawl/musinsa/route";
import { Search, ExternalLink, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function CrawlPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CrawledProduct | null>(null);

  const handleCrawl = async () => {
    if (!url.trim()) return;
    if (!url.includes("musinsa.com")) {
      toast.error("Please enter a valid Musinsa product URL.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/crawl/musinsa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Crawl failed.");
        return;
      }

      setResult(data.product);
      toast.success("Product info loaded!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 크롤링 결과를 들고 상품 등록 페이지로 이동
  const handleProceed = () => {
    if (!result) return;
    const params = new URLSearchParams({
      name: result.name,
      brand: result.brand,
      originalPrice: String(result.originalPrice),
      musinsaUrl: result.musinsaUrl,
      musinsaId: result.musinsaId,
    });
    router.push(`/admin/products/new?${params.toString()}`);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Crawl from Musinsa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Enter a Musinsa product URL to auto-fill product info. Images must be
          added manually due to copyright restrictions.
        </p>
      </div>

      {/* URL 입력 */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Musinsa Product URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCrawl()}
              placeholder="https://www.musinsa.com/products/123456"
              className="input-base flex-1"
              disabled={loading}
            />
            <button
              onClick={handleCrawl}
              disabled={loading || !url.trim()}
              className="btn-primary px-4 flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={15} />
              {loading ? "Loading..." : "Fetch"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            ※ Only text info (name, brand, price) is crawled. No images.
          </p>
        </div>

        {/* 크롤링 결과 */}
        {result && (
          <div className="border border-green-200 bg-green-50 p-4 space-y-3">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              ✓ Product Found
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">
                  Product Name
                </span>
                <span className="font-medium text-gray-900">{result.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">Brand</span>
                <span className="font-medium text-gray-900">
                  {result.brand || "—"}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">
                  Price (KRW)
                </span>
                <span className="font-medium text-gray-900">
                  ₩{result.originalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-28 flex-shrink-0">
                  Musinsa ID
                </span>
                <span className="font-mono text-gray-900">
                  {result.musinsaId}
                </span>
              </div>
            </div>
            <a
              href={result.musinsaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink size={11} />
              View on Musinsa
            </a>

            {/* 상품 등록으로 이동 */}
            <button
              onClick={handleProceed}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              Proceed to Register Product
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
