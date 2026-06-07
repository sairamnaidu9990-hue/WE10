"use client";

import { ClipboardCheck, Home, Newspaper, Sparkles } from "lucide-react";
import { useBrandSettings } from "./Header";

export const navItems = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Artikel", href: "#artikel", icon: Newspaper },
  { label: "Ulasan", href: "#ulasan", icon: Sparkles },
  { label: "Cek Transaksi", href: "#cek-transaksi", icon: ClipboardCheck },
];

function withAlpha(color: string, alpha: number) {
  const hex = color.trim();
  const shortHex = /^#([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  const fullHex = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (shortHex) {
    const [, r, g, b] = shortHex;
    return `rgba(${parseInt(r + r, 16)}, ${parseInt(g + g, 16)}, ${parseInt(b + b, 16)}, ${alpha})`;
  }

  if (fullHex) {
    const [, r, g, b] = fullHex;
    return `rgba(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha})`;
  }

  return color;
}

export default function MainNavbar() {
  const { settings, isLoading } = useBrandSettings();

  if (isLoading) {
    return (
      <nav className="sticky top-20 z-20 hidden border-b border-white/10 bg-[#101115]/75 backdrop-blur-xl md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 md:px-6">
          <span className="h-5 w-20 animate-pulse rounded bg-white/15" />
          <span className="h-5 w-24 animate-pulse rounded bg-white/15" />
          <span className="h-5 w-24 animate-pulse rounded bg-white/15" />
          <span className="h-5 w-32 animate-pulse rounded bg-white/15" />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="sticky top-20 z-20 hidden border-b backdrop-blur-xl md:block"
      style={{
        backgroundColor: withAlpha(settings.headerBackgroundColor, 0.72),
        borderColor: `${settings.headerAccentColor}33`,
        color: settings.headerTextColor,
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 overflow-x-auto px-3 md:px-6">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              className="flex h-full shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-black transition hover:opacity-85 md:px-4"
              href={item.href}
              style={{
                borderBottomColor: item.label === "Home" ? settings.headerAccentColor : "transparent",
              }}
            >
              <Icon size={18} />
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
