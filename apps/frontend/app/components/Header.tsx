"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { LogIn, LogOut, Menu, UserCircle, UserPlus, X } from "lucide-react";
import { navItems } from "./MainNavbar";

type BrandSettings = {
  brandName: string;
  frontendTitle: string;
  frontendDescription: string;
  logoUrl: string;
  faviconUrl: string;
  domain: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  headerAccentColor: string;
  frontendBackgroundColor: string;
  bannerEnabled: boolean;
  bannerImageUrl: string;
  bannerImageFit: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerLink: string;
  bannerBackgroundColor: string;
  bannerDesktopHeight: string;
  bannerMobileHeight: string;
  footerEnabled: boolean;
  footerTitle: string;
  footerDescription: string;
  footerCopyright: string;
  footerBackgroundColor: string;
  footerTextColor: string;
  footerLinkOneLabel: string;
  footerLinkOneUrl: string;
  footerLinkTwoLabel: string;
  footerLinkTwoUrl: string;
  footerLinkThreeLabel: string;
  footerLinkThreeUrl: string;
};

type AuthMode = "login" | "register";
type FrontendUser = {
  username: string;
  name: string;
  phone: string;
  email: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const defaultSettings: BrandSettings = {
  brandName: "WEB10",
  frontendTitle: "Platform WEB10 siap dikembangkan.",
  frontendDescription:
    "Header frontend ini membaca pengaturan brand dari backend sehingga nama, logo, domain, favicon, dan warna bisa diubah dari admin.",
  logoUrl: "",
  faviconUrl: "",
  domain: "",
  headerBackgroundColor: "#101115",
  headerTextColor: "#ffffff",
  headerAccentColor: "#ffffff",
  frontendBackgroundColor: "#f4f7fb",
  bannerEnabled: true,
  bannerImageUrl: "",
  bannerImageFit: "contain",
  bannerTitle: "Selamat datang di WEB10",
  bannerSubtitle: "Banner utama bisa diubah dari admin dashboard.",
  bannerLink: "",
  bannerBackgroundColor: "#17202a",
  bannerDesktopHeight: "260",
  bannerMobileHeight: "180",
  footerEnabled: true,
  footerTitle: "WEB10",
  footerDescription: "Platform WEB10 siap melayani kebutuhan digital kamu.",
  footerCopyright: "© 2026 WEB10. All rights reserved.",
  footerBackgroundColor: "#101115",
  footerTextColor: "#ffffff",
  footerLinkOneLabel: "Home",
  footerLinkOneUrl: "/",
  footerLinkTwoLabel: "Artikel",
  footerLinkTwoUrl: "#",
  footerLinkThreeLabel: "Cek Transaksi",
  footerLinkThreeUrl: "#",
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const storedUser = window.localStorage.getItem("we10_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  function handleLogout() {
    window.localStorage.removeItem("we10_user");
    setUser(null);
    setAuthMode(null);
    setMobileMenuOpen(false);

    if (window.location.pathname.startsWith("/user")) {
      window.location.href = "/";
    }
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    document.title = settings.frontendTitle || settings.brandName || "WEB10";

    let description = document.querySelector<HTMLMetaElement>("meta[name='description']");

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content = settings.frontendDescription || `${settings.brandName} frontend`;

    if (settings.faviconUrl) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }

      favicon.href = settings.faviconUrl;
    }
  }, [isLoading, settings]);

  if (isLoading) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#101115]/75 text-white shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 animate-pulse rounded-lg bg-white/15" />
            <span className="h-6 w-24 animate-pulse rounded bg-white/15" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="h-11 w-24 animate-pulse rounded-xl bg-white/15" />
            <span className="h-11 w-24 animate-pulse rounded-xl bg-white/15" />
          </div>
          <span className="h-11 w-11 animate-pulse rounded-xl bg-white/15 md:hidden" />
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-30 border-b shadow-sm backdrop-blur-xl"
      style={{
        backgroundColor: withAlpha(settings.headerBackgroundColor, 0.74),
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
          <span className={`text-lg font-bold ${isLoading ? "h-6 w-24 animate-pulse rounded bg-white/15 text-transparent" : ""}`}>
            {settings.brandName || "WEB10"}
          </span>
        </a>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <a
                className="grid h-11 w-11 place-items-center rounded-xl border"
                href="/user/dashboard"
                style={{ borderColor: `${settings.headerAccentColor}66` }}
                title="Dashboard user"
              >
                <UserCircle size={24} />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-11 w-11 place-items-center rounded-xl border transition hover:opacity-85"
                style={{ borderColor: `${settings.headerAccentColor}66` }}
                title="Keluar"
                aria-label="Keluar"
              >
                <LogOut size={21} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
            className="flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:opacity-85"
            style={{ borderColor: `${settings.headerAccentColor}66` }}
          >
            <LogIn size={18} />
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("register")}
            className="flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold transition hover:opacity-90"
            style={{
              backgroundColor: settings.headerAccentColor,
              color: settings.headerBackgroundColor,
            }}
          >
            <UserPlus size={18} />
            Daftar
          </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-xl border md:hidden"
          style={{ borderColor: `${settings.headerAccentColor}66` }}
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu"
          />
          <aside
            className="absolute left-0 top-0 flex h-full w-[82vw] max-w-sm flex-col border-r shadow-2xl"
            style={{
              backgroundColor: settings.headerBackgroundColor,
              borderColor: `${settings.headerAccentColor}44`,
              color: settings.headerTextColor,
            }}
          >
            <div className="flex h-20 items-center justify-between border-b px-5" style={{ borderColor: `${settings.headerAccentColor}33` }}>
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
                      color: settings.headerBackgroundColor,
                    }}
                  >
                    W
                  </span>
                )}
                <strong className="text-base">{settings.brandName || "WEB10"}</strong>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border"
                style={{ borderColor: `${settings.headerAccentColor}66` }}
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-2 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.label}
                    className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition hover:bg-white/10"
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={19} />
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="grid gap-3 border-t p-4" style={{ borderColor: `${settings.headerAccentColor}33` }}>
              {user ? (
                <>
                  <a
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold"
                    href="/user/dashboard"
                    style={{ borderColor: `${settings.headerAccentColor}66` }}
                  >
                    <UserCircle size={18} />
                    Dashboard User
                  </a>
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold"
                    onClick={handleLogout}
                    style={{ borderColor: `${settings.headerAccentColor}66` }}
                  >
                    <LogOut size={18} />
                    Keluar
                  </button>
                </>
              ) : (
                <>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthMode("login");
                }}
                style={{ borderColor: `${settings.headerAccentColor}66` }}
              >
                <LogIn size={18} />
                Masuk
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthMode("register");
                }}
                style={{
                  backgroundColor: settings.headerAccentColor,
                  color: settings.headerBackgroundColor,
                }}
              >
                <UserPlus size={18} />
                Daftar
              </button>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}

      {authMode ? (
        <AuthModal
          mode={authMode}
          form={form}
          message={authMessage}
          loading={authLoading}
          onClose={() => {
            setAuthMode(null);
            setAuthMessage("");
          }}
          onSwitch={setAuthMode}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onSubmit={async () => {
            setAuthLoading(true);
            setAuthMessage("");
            try {
              const path = authMode === "login" ? "/api/users/login" : "/api/users/register";
              const payload =
                authMode === "login"
                  ? { username: form.username, password: form.password }
                  : form;
              const response = await fetch(`${apiUrl}${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await response.json();
              if (!response.ok) throw new Error(data.message || "Request gagal.");
              window.localStorage.setItem("we10_user", JSON.stringify(data.user));
              setUser(data.user);
              setAuthMode(null);
              setForm({ username: "", password: "", name: "", phone: "", email: "" });
            } catch (error) {
              setAuthMessage(error instanceof Error ? error.message : "Request gagal.");
            } finally {
              setAuthLoading(false);
            }
          }}
        />
      ) : null}
    </header>
  );
}

function AuthModal({
  mode,
  form,
  message,
  loading,
  onClose,
  onSwitch,
  onChange,
  onSubmit,
}: {
  mode: AuthMode;
  form: { username: string; password: string; name: string; phone: string; email: string };
  message: string;
  loading: boolean;
  onClose: () => void;
  onSwitch: (mode: AuthMode) => void;
  onChange: (field: keyof typeof form, value: string) => void;
  onSubmit: () => void;
}) {
  const isRegister = mode === "register";

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/70 px-4 py-8 text-white">
      <div className="flex min-h-full items-center justify-center">
      <form
        className="my-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#202126] p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{isRegister ? "Daftar" : "Masuk"}</h2>
            <p className="mt-1 text-sm text-[#a1a8b3]">
              {isRegister ? "Buat akun WEB10 baru." : "Masuk ke akun WEB10."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10">
            <X size={19} />
          </button>
        </div>

        <div className="grid gap-3">
          <input className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none" placeholder="Username" value={form.username} onChange={(e) => onChange("username", e.target.value)} required />
          {isRegister ? (
            <>
              <input className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none" placeholder="Name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />
              <input className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none" placeholder="No hp" value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required />
              <input className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none" placeholder="Email" type="email" value={form.email} onChange={(e) => onChange("email", e.target.value)} required />
            </>
          ) : null}
          <input className="h-12 rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none" placeholder="Password" type="password" value={form.password} onChange={(e) => onChange("password", e.target.value)} required />
        </div>

        <button className="mt-5 h-12 w-full rounded-xl bg-white font-bold text-black disabled:opacity-70" disabled={loading}>
          {loading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
        </button>
        <p className="mt-3 min-h-5 text-center text-sm text-[#ff9c90]">{message}</p>
        <button
          type="button"
          onClick={() => onSwitch(isRegister ? "login" : "register")}
          className="mt-2 w-full text-center text-sm font-semibold text-[#a1a8b3]"
        >
          {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
        </button>
      </form>
      </div>
    </div>
  );
}

export function BrandBanner() {
  const { settings, isLoading } = useBrandSettings();
  const mobileHeight = Number(settings.bannerMobileHeight) || 180;
  const desktopHeight = Number(settings.bannerDesktopHeight) || 260;

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
        className="relative min-h-[var(--banner-mobile-height)] overflow-hidden rounded-2xl border shadow-sm md:min-h-[var(--banner-desktop-height)]"
        style={{
          "--banner-mobile-height": `${mobileHeight}px`,
          "--banner-desktop-height": `${desktopHeight}px`,
          backgroundColor: settings.bannerBackgroundColor,
          borderColor: `${settings.headerAccentColor}33`,
          color: settings.headerTextColor,
        } as CSSProperties}
      >
        {settings.bannerImageUrl ? (
          <img
            className="absolute inset-0 h-full w-full"
            src={settings.bannerImageUrl}
            alt={settings.bannerTitle || "WEB10 banner"}
            style={{ objectFit: settings.bannerImageFit === "cover" ? "cover" : "contain" }}
          />
        ) : null}
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
