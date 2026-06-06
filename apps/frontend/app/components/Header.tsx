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
};

export default function Header() {
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
