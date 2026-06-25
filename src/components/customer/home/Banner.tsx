// src/components/customer/home/Banner.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    headline: "New Season.",
    subheadline: "Korean Style, Canadian Doors.",
    description:
      "Discover the freshest looks from Seoul — curated and shipped directly to you.",
    cta: { label: "Shop Men", href: "/products?category=men" },
    bg: "bg-gradient-to-br from-stone-800 to-stone-600",
  },
  {
    id: 2,
    headline: "Women's Edit.",
    subheadline: "K-Fashion, Your Way.",
    description:
      "From minimalist staples to bold statement pieces — all the way from Musinsa.",
    cta: { label: "Shop Women", href: "/products?category=women" },
    bg: "bg-gradient-to-br from-zinc-700 to-neutral-600",
  },
  {
    id: 3,
    headline: "Unisex Essentials.",
    subheadline: "No Gender. Just Good Style.",
    description: "Clean silhouettes and versatile pieces for everyone.",
    cta: { label: "Shop Unisex", href: "/products?category=unisex" },
    bg: "bg-gradient-to-br from-primary to-primary-dark",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);

  // 자동 슬라이드 (4초)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section
      className={`relative ${slide.bg} text-white transition-colors duration-700`}
    >
      <div className="max-w-7xl mx-auto px-4 py-28 md:py-40">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-4 font-medium">
            Korean Fashion for Canada
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-3">
            {slide.headline}
          </h1>
          <h2 className="font-display text-2xl md:text-3xl font-normal text-white/80 mb-5">
            {slide.subheadline}
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">
            {slide.description}
          </p>
          <Link
            href={slide.cta.href}
            className="inline-block bg-white text-primary px-8 py-3.5 font-semibold text-sm 
                       tracking-wide hover:bg-cream transition-colors duration-200"
          >
            {slide.cta.label}
          </Link>
        </div>
      </div>

      {/* 이전/다음 버튼 */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 
                   p-2 transition-colors duration-150"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 
                   p-2 transition-colors duration-150"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-white" />
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-0.5 transition-all duration-300 
              ${i === current ? "w-8 bg-white" : "w-4 bg-white/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
