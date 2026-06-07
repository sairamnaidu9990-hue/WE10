"use client";

import Header, { BrandBanner, useBrandSettings } from "./components/Header";
import Footer from "./components/Footer";
import MainNavbar from "./components/MainNavbar";

export default function Home() {
  const { settings, isLoading } = useBrandSettings();

  return (
    <main
      className="min-h-screen text-[#101115]"
      style={{ backgroundColor: settings.frontendBackgroundColor }}
    >
      <Header />
      <MainNavbar />
      <BrandBanner />

      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:px-8">
        <div className="max-w-2xl">
          {isLoading ? (
            <div className="grid gap-5">
              <div className="h-4 w-24 animate-pulse rounded bg-[#d9e2ec]" />
              <div className="grid gap-3">
                <div className="h-12 w-full max-w-xl animate-pulse rounded bg-[#d9e2ec]" />
                <div className="h-12 w-4/5 animate-pulse rounded bg-[#d9e2ec]" />
              </div>
              <div className="grid gap-2">
                <div className="h-5 w-full animate-pulse rounded bg-[#d9e2ec]" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#d9e2ec]" />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-black uppercase text-[#0e7490]">
                {settings.brandName || "WEB10"}
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
                {settings.frontendTitle || settings.brandName || "WEB10"}
              </h1>
              <p className="mt-5 text-lg leading-8 text-[#5d6673]">
                {settings.frontendDescription || `${settings.brandName || "WEB10"} frontend`}
              </p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
