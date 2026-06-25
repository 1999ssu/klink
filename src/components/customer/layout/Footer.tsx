// src/components/customer/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div>
            <h3 className="font-display text-xl font-bold text-primary mb-3">
              KStyle CA
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bringing the latest Korean fashion from Musinsa directly to
              Canada. We act as an intermediary — all sales are final.
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2">
              {["Men", "Women", "Unisex"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${cat.toLowerCase()}`}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 정책 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">
              Policy
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/policy/shipping"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/policy/no-return"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  No Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policy/privacy"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row 
                        justify-between items-center gap-3"
        >
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} KStyle CA. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 text-center">
            ⚠️ No returns, exchanges, or refunds on international orders.
          </p>
        </div>
      </div>
    </footer>
  );
}
