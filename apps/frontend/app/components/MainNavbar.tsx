"use client";

import { ClipboardCheck, Home, Newspaper, Sparkles } from "lucide-react";
import { useBrandSettings } from "./Header";

const navItems = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Artikel", href: "#artikel", icon: Newspaper },
  { label: "Ulasan", href: "#ulasan", icon: Sparkles },
  { label: "Cek Transaksi", href: "#cek-transaksi", icon: ClipboardCheck },
];

export default function MainNavbar() {
  const { settings } = useBrandSettings();

  return (
    <nav
      className="border-b"
      style={{
        backgroundColor: settings.headerBackgroundColor,
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
