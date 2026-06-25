// src/app/(customer)/layout.tsx
import Header from "@/components/customer/layout/Header";
import Footer from "@/components/customer/layout/Footer";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
