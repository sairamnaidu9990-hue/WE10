"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type LoginState = "idle" | "loading" | "error";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          username: email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      window.localStorage.setItem("we10_admin", JSON.stringify(data.admin));
      router.push("/dashboard");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Login gagal.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#101115] px-5 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[448px] rounded-2xl border border-[#34363d] bg-[#202126] px-8 py-9 shadow-[0_28px_80px_rgba(0,0,0,0.32)]"
      >
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-bold tracking-normal text-[#f4f5f7]">Admin Login</h1>
          <p className="mt-3 text-sm text-[#a1a8b3]">Masuk ke dashboard KITAGG</p>
        </div>

        <label className="mb-5 block">
          <span className="mb-2 block text-sm font-medium text-[#d5d8df]">Email Admin</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-[50px] w-full rounded-xl border border-[#444751] bg-[#2a2b31] px-4 text-[15px] text-[#eef0f4] outline-none transition placeholder:text-[#818895] focus:border-[#6a6f7c] focus:ring-4 focus:ring-white/5"
            type="text"
            autoComplete="username"
            placeholder="admin@webtopup.com"
            required
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-[#d5d8df]">Kata Sandi</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-[50px] w-full rounded-xl border border-[#444751] bg-[#2a2b31] px-4 text-[15px] text-[#eef0f4] outline-none transition placeholder:text-[#818895] focus:border-[#6a6f7c] focus:ring-4 focus:ring-white/5"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            required
          />
        </label>

        <button
          className="mt-1 h-[47px] w-full rounded-xl bg-[#f7f7f8] text-base font-medium text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
          type="submit"
          disabled={state === "loading"}
        >
          {state === "loading" ? "Memeriksa..." : "Masuk"}
        </button>

        <p className="mt-4 min-h-5 text-center text-sm text-[#ff8a7a]" role="status">
          {state === "error" ? message : ""}
        </p>
      </form>
    </main>
  );
}
