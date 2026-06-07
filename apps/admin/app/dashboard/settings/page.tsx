"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";

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
  bannerTitle: string;
  bannerSubtitle: string;
  bannerLink: string;
  bannerBackgroundColor: string;
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

type BrandTextField = Exclude<keyof BrandSettings, "bannerEnabled" | "footerEnabled">;
type BrandColorField =
  | "headerBackgroundColor"
  | "headerTextColor"
  | "headerAccentColor"
  | "frontendBackgroundColor"
  | "bannerBackgroundColor"
  | "footerBackgroundColor"
  | "footerTextColor";

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
  headerAccentColor: "#38bdf8",
  frontendBackgroundColor: "#f4f7fb",
  bannerEnabled: true,
  bannerImageUrl: "",
  bannerTitle: "Selamat datang di WEB10",
  bannerSubtitle: "Banner utama bisa diubah dari admin dashboard.",
  bannerLink: "",
  bannerBackgroundColor: "#17202a",
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${apiUrl}/api/brand-settings`);
        const data = await response.json();

        if (response.ok) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch {
        setMessage("Gagal memuat pengaturan brand.");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  function updateField(field: BrandTextField, value: string) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateBooleanField(field: keyof BrandSettings, value: boolean) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/brand-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan pengaturan brand.");
      }

      setSettings({ ...defaultSettings, ...data.settings });
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan pengaturan brand.");
    }
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Pengaturan Brand</h1>
          <p className="mt-2 text-sm text-[#a1a8b3]">
            Ubah nama brand, logo, favicon, domain, dan warna header frontend.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-2xl border border-white/10 bg-[#202126] p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Nama Brand</span>
              <input
                value={settings.brandName}
                onChange={(event) => updateField("brandName", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="WEB10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Domain Brand</span>
              <input
                value={settings.domain}
                onChange={(event) => updateField("domain", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://domainkamu.com"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">
                Title Frontend
              </span>
              <input
                value={settings.frontendTitle}
                onChange={(event) => updateField("frontendTitle", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Platform WEB10 siap dikembangkan."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">
                Deskripsi Frontend
              </span>
              <input
                value={settings.frontendDescription}
                onChange={(event) => updateField("frontendDescription", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Deskripsi frontend"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Logo URL</span>
              <input
                value={settings.logoUrl}
                onChange={(event) => updateField("logoUrl", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://.../logo.png"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Favicon URL</span>
              <input
                value={settings.faviconUrl}
                onChange={(event) => updateField("faviconUrl", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://.../favicon.ico"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {([
              ["headerBackgroundColor", "Warna Background Header"],
              ["headerTextColor", "Warna Text Header"],
              ["headerAccentColor", "Warna Accent Header"],
              ["frontendBackgroundColor", "Warna Background Frontend"],
            ] as Array<[BrandColorField, string]>).map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">{label}</span>
                <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-[#2a2b31]">
                  <input
                    value={settings[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="h-full w-14 border-0 bg-transparent p-1"
                    type="color"
                  />
                  <input
                    value={settings[field]}
                    onChange={(event) => updateField(field, event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                  />
                </div>
              </label>
            ))}
          </div>

          <div
            className="rounded-2xl border p-5"
            style={{
              backgroundColor: settings.headerBackgroundColor,
              borderColor: settings.headerAccentColor,
              color: settings.headerTextColor,
            }}
          >
            <p className="text-sm opacity-70">Preview Header</p>
            <div className="mt-3 flex items-center gap-3">
              {settings.logoUrl ? (
                <img className="h-10 w-10 rounded-lg object-cover" src={settings.logoUrl} alt="" />
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
              <strong className="text-xl">{settings.brandName || "WEB10"}</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#18191e] p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Banner Frontend</h2>
                <p className="mt-1 text-sm text-[#a1a8b3]">
                  Banner tampil sebagai space utama tepat di bawah header frontend.
                </p>
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-[#d5d8df]">
                <input
                  checked={settings.bannerEnabled}
                  onChange={(event) => updateBooleanField("bannerEnabled", event.target.checked)}
                  className="h-4 w-4 accent-white"
                  type="checkbox"
                />
                Aktifkan banner
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Judul Banner</span>
                <input
                  value={settings.bannerTitle}
                  onChange={(event) => updateField("bannerTitle", event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                  placeholder="Selamat datang di WEB10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Link Banner</span>
                <input
                  value={settings.bannerLink}
                  onChange={(event) => updateField("bannerLink", event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_220px]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Subtitle Banner</span>
                <input
                  value={settings.bannerSubtitle}
                  onChange={(event) => updateField("bannerSubtitle", event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                  placeholder="Deskripsi banner"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Warna Background</span>
                <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-[#2a2b31]">
                  <input
                    value={settings.bannerBackgroundColor}
                    onChange={(event) => updateField("bannerBackgroundColor", event.target.value)}
                    className="h-full w-14 border-0 bg-transparent p-1"
                    type="color"
                  />
                  <input
                    value={settings.bannerBackgroundColor}
                    onChange={(event) => updateField("bannerBackgroundColor", event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                  />
                </div>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Image URL Banner</span>
              <input
                value={settings.bannerImageUrl}
                onChange={(event) => updateField("bannerImageUrl", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://.../banner.jpg"
              />
            </label>

            <div
              className="relative mt-5 min-h-[180px] overflow-hidden rounded-2xl border"
              style={{
                backgroundColor: settings.bannerBackgroundColor,
                borderColor: settings.headerAccentColor,
                color: settings.headerTextColor,
              }}
            >
              {settings.bannerImageUrl ? (
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src={settings.bannerImageUrl}
                  alt=""
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
              <div className="relative flex min-h-[180px] max-w-xl flex-col justify-end p-6">
                <p
                  className="text-sm font-black uppercase"
                  style={{ color: settings.headerAccentColor }}
                >
                  {settings.brandName || "WEB10"}
                </p>
                <h3 className="mt-2 text-3xl font-black">
                  {settings.bannerTitle || "Selamat datang di WEB10"}
                </h3>
                <p className="mt-2 text-sm opacity-80">
                  {settings.bannerSubtitle || "Banner utama bisa diubah dari admin dashboard."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#18191e] p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">Footer Frontend</h2>
                <p className="mt-1 text-sm text-[#a1a8b3]">
                  Footer tampil di bagian bawah halaman frontend dan dashboard user.
                </p>
              </div>
              <label className="flex items-center gap-3 text-sm font-semibold text-[#d5d8df]">
                <input
                  checked={settings.footerEnabled}
                  onChange={(event) => updateBooleanField("footerEnabled", event.target.checked)}
                  className="h-4 w-4 accent-white"
                  type="checkbox"
                />
                Aktifkan footer
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Judul Footer</span>
                <input
                  value={settings.footerTitle}
                  onChange={(event) => updateField("footerTitle", event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                  placeholder="WEB10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Copyright</span>
                <input
                  value={settings.footerCopyright}
                  onChange={(event) => updateField("footerCopyright", event.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                  placeholder="© 2026 WEB10. All rights reserved."
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Deskripsi Footer</span>
              <input
                value={settings.footerDescription}
                onChange={(event) => updateField("footerDescription", event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Platform WEB10 siap melayani kebutuhan digital kamu."
              />
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {([
                ["footerBackgroundColor", "Warna Background Footer"],
                ["footerTextColor", "Warna Text Footer"],
              ] as Array<[BrandColorField, string]>).map(([field, label]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">{label}</span>
                  <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-[#2a2b31]">
                    <input
                      value={settings[field]}
                      onChange={(event) => updateField(field, event.target.value)}
                      className="h-full w-14 border-0 bg-transparent p-1"
                      type="color"
                    />
                    <input
                      value={settings[field]}
                      onChange={(event) => updateField(field, event.target.value)}
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([
                ["footerLinkOneLabel", "footerLinkOneUrl", "Link 1"],
                ["footerLinkTwoLabel", "footerLinkTwoUrl", "Link 2"],
                ["footerLinkThreeLabel", "footerLinkThreeUrl", "Link 3"],
              ] as Array<[BrandTextField, BrandTextField, string]>).map(([labelField, urlField, label]) => (
                <div key={label} className="grid gap-3 rounded-2xl border border-white/10 p-4">
                  <p className="text-sm font-bold text-[#d5d8df]">{label}</p>
                  <input
                    value={settings[labelField]}
                    onChange={(event) => updateField(labelField, event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                    placeholder="Label"
                  />
                  <input
                    value={settings[urlField]}
                    onChange={(event) => updateField(urlField, event.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                    placeholder="URL"
                  />
                </div>
              ))}
            </div>

            <div
              className="mt-5 rounded-2xl border p-5"
              style={{
                backgroundColor: settings.footerBackgroundColor,
                borderColor: settings.headerAccentColor,
                color: settings.footerTextColor,
              }}
            >
              <p className="text-sm opacity-70">Preview Footer</p>
              <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <strong className="text-xl">{settings.footerTitle || settings.brandName || "WEB10"}</strong>
                  <p className="mt-2 max-w-xl text-sm leading-6 opacity-75">
                    {settings.footerDescription || "Platform WEB10 siap melayani kebutuhan digital kamu."}
                  </p>
                </div>
                <div className="grid gap-2 text-sm font-bold">
                  {[settings.footerLinkOneLabel, settings.footerLinkTwoLabel, settings.footerLinkThreeLabel]
                    .filter(Boolean)
                    .map((label) => (
                      <span key={label} className="rounded-lg border px-3 py-2" style={{ borderColor: `${settings.headerAccentColor}55` }}>
                        {label}
                      </span>
                    ))}
                </div>
              </div>
              <p className="mt-5 border-t pt-4 text-xs opacity-70" style={{ borderColor: `${settings.headerAccentColor}55` }}>
                {settings.footerCopyright || `© 2026 ${settings.brandName || "WEB10"}. All rights reserved.`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="min-h-5 text-sm text-[#a1d99b]" role="status">
              {loading ? "Memuat pengaturan..." : message}
            </p>
            <button className="h-12 rounded-xl bg-white px-6 text-sm font-bold text-black">
              Simpan Brand
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}
