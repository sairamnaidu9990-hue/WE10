"use client";

import { useEffect, useState } from "react";

type BrandSettings = {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  domain: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  headerAccentColor: string;
  bannerEnabled: boolean;
  bannerImageUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerLink: string;
  bannerBackgroundColor: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const defaultSettings: BrandSettings = {
  brandName: "WEB10",
  logoUrl: "",
  faviconUrl: "",
  domain: "",
  headerBackgroundColor: "#101115",
  headerTextColor: "#ffffff",
  headerAccentColor: "#38bdf8",
  bannerEnabled: true,
  bannerImageUrl: "",
  bannerTitle: "Selamat datang di WEB10",
  bannerSubtitle: "Banner utama bisa diubah dari admin dashboard.",
  bannerLink: "",
  bannerBackgroundColor: "#17202a",
};

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);

  useEffect(() => {
    async function loadBrandSettings() {
      try {
        const response = await fetch(`${apiUrl}/api/brand-settings`);
        const data = await response.json();

        if (response.ok) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch {
        setSettings(defaultSettings);
      }
    }

    loadBrandSettings();
  }, []);

  return settings;
}

export default function Header() {
  const settings = useBrandSettings();

  useEffect(() => {
    document.title = settings.brandName || "WEB10";

    if (settings.faviconUrl) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = settings.faviconUrl;
    }
  }, [settings]);

  return (
    <header
      className="sticky top-0 z-20 border-b shadow-sm"
      style={{
        backgroundColor: settings.headerBackgroundColor,
        borderColor: `${settings.headerAccentColor}44`,
        color: settings.headerTextColor,
      }}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
        <a className="flex items-center gap-3" href={settings.domain || "/"}>
          {settings.logoUrl ? (
            <img
              className="h-10 w-10 rounded-lg object-cover"
              src={settings.logoUrl}
              alt={`${settings.brandName} logo`}
            />
          ) : (
            <span
              className="grid h-10 w-10 place-items-center rounded-lg text-sm font-black"
              style={{
                backgroundColor: settings.headerAccentColor,
                color: settings.headerBackgroundColor,
              }}
            >
              W
            </span>
          )}
          <span className="text-xl font-black">{settings.brandName || "WEB10"}</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <a href="#">Beranda</a>
          <a href="#">Produk</a>
          <a href="#">Transaksi</a>
          <a href="#">Bantuan</a>
        </nav>
      </div>
    </header>
  );
}

export function BrandBanner() {
  const settings = useBrandSettings();

  if (!settings.bannerEnabled) {
    return null;
  }

  const banner = (
    <section className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
      <div
        className="relative min-h-[180px] overflow-hidden rounded-2xl border shadow-sm md:min-h-[260px]"
        style={{
          backgroundColor: settings.bannerBackgroundColor,
          borderColor: `${settings.headerAccentColor}33`,
          color: settings.headerTextColor,
        }}
      >
        {settings.bannerImageUrl ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={settings.bannerImageUrl}
            alt={settings.bannerTitle || "WEB10 banner"}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="relative flex min-h-[180px] max-w-2xl flex-col justify-end p-6 md:min-h-[260px] md:p-8">
          <p className="text-sm font-black uppercase" style={{ color: settings.headerAccentColor }}>
            {settings.brandName || "WEB10"}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
            {settings.bannerTitle || "Selamat datang di WEB10"}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 opacity-80">
            {settings.bannerSubtitle || "Banner utama bisa diubah dari admin dashboard."}
          </p>
        </div>
      </div>
    </section>
  );

  if (settings.bannerLink) {
    return (
      <a className="block" href={settings.bannerLink}>
        {banner}
      </a>
    );
  }

  return banner;
}
