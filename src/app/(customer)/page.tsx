// src/app/(customer)/page.tsx
import Banner from "@/components/customer/home/Banner";
import FeaturedProducts from "@/components/customer/home/FeaturedProducts";
import NoReturnBanner from "@/components/customer/home/NoReturnBanner";

export default function HomePage() {
  return (
    <>
      <NoReturnBanner />
      <Banner />
      <FeaturedProducts />
    </>
  );
}
