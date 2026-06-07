"use client";

import Header, { BrandBanner, useBrandSettings } from "./components/Header";
import Footer from "./components/Footer";
import MainNavbar from "./components/MainNavbar";
import ProductSection from "./components/ProductSection";

export default function Home() {
  const { settings } = useBrandSettings();

  return (
    <main
      className="min-h-screen text-[#101115]"
      style={{ backgroundColor: settings.frontendBackgroundColor }}
    >
      <Header />
      <MainNavbar />
      <BrandBanner />
      <ProductSection />
      <Footer />
    </main>
  );
}
