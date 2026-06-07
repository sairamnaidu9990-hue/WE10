"use client";

import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

type BrandSettings = {
  brandName: string;
  logoUrl: string;
  faviconUrl: string;
  domain: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  headerAccentColor: string;
  frontendBackgroundColor: string;
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
  frontendBackgroundColor: "#f4f7fb",
  bannerEnabled: true,
  bannerImageUrl: "",
  bannerTitle: "Selamat datang di WEB10",
  bannerSubtitle: "Banner utama bisa diubah dari admin dashboard.",
  bannerLink: "",
  bannerBackgroundColor: "#17202a",
};

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    }

    loadBrandSettings();
  }, []);

  return { settings, isLoading };
}

export default function Header() {
  const { settings, isLoading } = useBrandSettings();

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
          {isLoading ? (
            <span className="h-10 w-10 animate-pulse rounded-lg bg-white/15" />
          ) : settings.logoUrl ? (
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
          <span className={`text-xl font-black ${isLoading ? "h-6 w-24 animate-pulse rounded bg-white/15 text-transparent" : ""}`}>
            {settings.brandName || "WEB10"}
          </span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          <a
            className="flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:opacity-85"
            href="#login"
            style={{ borderColor: `${settings.headerAccentColor}66` }}
          >
            <LogIn size={18} />
            Masuk
          </a>
          <a
            className="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition hover:opacity-90"
            href="#register"
            style={{
              backgroundColor: settings.headerAccentColor,
              color: settings.headerBackgroundColor,
            }}
          >
            <UserPlus size={18} />
            Daftar
          </a>
        </div>
      </div>
    </header>
  );
}

export function BrandBanner() {
  const { settings, isLoading } = useBrandSettings();

  if (!settings.bannerEnabled) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
        <div className="min-h-[180px] overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#e6edf5] md:min-h-[260px]">
          <div className="h-full min-h-[180px] animate-pulse bg-gradient-to-r from-[#d9e2ec] via-[#f4f7fb] to-[#d9e2ec] md:min-h-[260px]" />
        </div>
      </section>
    );
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
