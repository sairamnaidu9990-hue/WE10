"use client";

import { FormEvent, useState } from "react";

type LoginState = "idle" | "loading" | "success" | "error";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<LoginState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      setState("success");
      setMessage(`Selamat datang, ${data.admin.username}.`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Login gagal.");
    }
  }

  return (
    <main className="min-h-screen bg-[#edf3f7] text-[#17202a]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex min-h-[44vh] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,#0e7490,#12395a_52%,#182333)] p-8 text-white md:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_22%,rgba(245,158,11,0.42),transparent_24%)]" />
          <div className="absolute -bottom-32 -right-24 h-96 w-96 rotate-[28deg] border border-white/20" />

          <div className="relative w-max rounded-lg border border-white/30 px-4 py-3 text-lg font-black">
            WE10
          </div>

          <div className="relative max-w-2xl py-12">
            <p className="mb-3 text-sm font-black uppercase text-white/70">Admin Console</p>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Kelola panel WE10 dengan akses yang aman.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              Masuk menggunakan akun admin yang tersimpan di database MongoDB.
            </p>
          </div>

          <div className="relative flex max-w-md gap-4 rounded-lg border border-white/20 bg-white/10 p-5 backdrop-blur">
            <span className="mt-1 h-3 w-3 rounded-full bg-[#18a058] shadow-[0_0_0_6px_rgba(24,160,88,0.22)]" />
            <div>
              <strong>Backend aktif</strong>
              <p className="mt-1 leading-6 text-white/70">
                Login divalidasi lewat API backend dan data user di MongoDB.
              </p>
            </div>
          </div>
        </section>

        <section className="grid place-items-center p-6 md:p-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-lg border border-[#d9e2ec] bg-white/95 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.16)] md:p-9"
          >
            <div className="mb-8">
              <p className="mb-3 text-sm font-black uppercase text-[#0e7490]">Secure Login</p>
              <h2 className="text-3xl font-black">Masuk Admin</h2>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-bold text-[#344054]">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-12 w-full rounded-lg border border-[#d9e2ec] bg-[#f7fafc] px-4 outline-none transition focus:border-[#1f6feb] focus:bg-white focus:ring-4 focus:ring-[#1f6feb]/10"
                type="text"
                autoComplete="username"
                placeholder="Masukkan username"
                required
              />
            </label>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-[#344054]">Password</span>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[#d9e2ec] bg-[#f7fafc] px-4 pr-20 outline-none transition focus:border-[#1f6feb] focus:bg-white focus:ring-4 focus:ring-[#1f6feb]/10"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-2 h-8 rounded-lg bg-[#e6f6f8] px-3 text-sm font-black text-[#0e7490]"
                >
                  {showPassword ? "Tutup" : "Lihat"}
                </button>
              </div>
            </label>

            <div className="mb-6 flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 text-[#667085]">
                <input className="h-4 w-4 accent-[#0e7490]" type="checkbox" />
                Ingat sesi ini
              </label>
              <a className="font-black text-[#1f6feb]" href={`${apiUrl}/health`}>
                Status server
              </a>
            </div>

            <button
              className="h-12 w-full rounded-lg bg-[linear-gradient(135deg,#0e7490,#1f6feb)] font-black text-white shadow-[0_12px_28px_rgba(14,116,144,0.25)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
              type="submit"
              disabled={state === "loading"}
            >
              {state === "loading" ? "Memeriksa..." : "Masuk"}
            </button>

            <p
              className={`mt-4 min-h-6 text-sm ${
                state === "success"
                  ? "text-[#18a058]"
                  : state === "error"
                    ? "text-[#c2410c]"
                    : "text-[#667085]"
              }`}
              role="status"
            >
              {message}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
