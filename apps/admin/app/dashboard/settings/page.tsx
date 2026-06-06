"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";

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

  function updateField(field: keyof BrandSettings, value: string) {
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
            {[
              ["headerBackgroundColor", "Warna Background Header"],
              ["headerTextColor", "Warna Text Header"],
              ["headerAccentColor", "Warna Accent Header"],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">{label}</span>
                <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-[#2a2b31]">
                  <input
                    value={settings[field as keyof BrandSettings]}
                    onChange={(event) =>
                      updateField(field as keyof BrandSettings, event.target.value)
                    }
                    className="h-full w-14 border-0 bg-transparent p-1"
                    type="color"
                  />
                  <input
                    value={settings[field as keyof BrandSettings]}
                    onChange={(event) =>
                      updateField(field as keyof BrandSettings, event.target.value)
                    }
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
