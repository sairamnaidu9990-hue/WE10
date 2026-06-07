"use client";

import { ExternalLink } from "lucide-react";
import { useBrandSettings } from "./Header";

export default function Footer() {
  const { settings, isLoading } = useBrandSettings();

  if (isLoading) {
    return (
      <footer className="mt-auto border-t border-[#d9e2ec] bg-[#101115]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 animate-pulse rounded-lg bg-white/15" />
              <span className="h-6 w-28 animate-pulse rounded bg-white/15" />
            </div>
            <div className="mt-4 grid gap-2">
              <span className="h-4 w-full max-w-md animate-pulse rounded bg-white/15" />
              <span className="h-4 w-3/4 animate-pulse rounded bg-white/15" />
            </div>
          </div>
          <div className="grid gap-3 md:min-w-56">
            <span className="h-10 animate-pulse rounded-lg bg-white/15" />
            <span className="h-10 animate-pulse rounded-lg bg-white/15" />
            <span className="h-10 animate-pulse rounded-lg bg-white/15" />
          </div>
        </div>
      </footer>
    );
  }

  if (!settings.footerEnabled) {
    return null;
  }

  const links = [
    { label: settings.footerLinkOneLabel, url: settings.footerLinkOneUrl },
    { label: settings.footerLinkTwoLabel, url: settings.footerLinkTwoUrl },
    { label: settings.footerLinkThreeLabel, url: settings.footerLinkThreeUrl },
  ].filter((link) => link.label && link.url);

  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: settings.footerBackgroundColor,
        borderColor: `${settings.headerAccentColor}44`,
        color: settings.footerTextColor,
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
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
                  color: settings.footerBackgroundColor,
                }}
              >
                W
              </span>
            )}
            <strong className="text-xl font-black">
              {settings.footerTitle || settings.brandName || "WEB10"}
            </strong>
          </div>
          <p className="mt-4 text-sm leading-6 opacity-75">
            {settings.footerDescription || "Platform WEB10 siap melayani kebutuhan digital kamu."}
          </p>
        </div>

        <nav className="flex flex-col gap-3 md:min-w-56">
          {links.map((link) => (
            <a
              key={`${link.label}-${link.url}`}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-bold transition hover:bg-white/10"
              href={link.url}
              style={{ borderColor: `${settings.headerAccentColor}33` }}
            >
              {link.label}
              <ExternalLink size={16} />
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t px-5 py-4 text-center text-xs opacity-70" style={{ borderColor: `${settings.headerAccentColor}33` }}>
        {settings.footerCopyright || `© 2026 ${settings.brandName || "WEB10"}. All rights reserved.`}
      </div>
    </footer>
  );
}
