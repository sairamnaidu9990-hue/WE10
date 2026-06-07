"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import MainNavbar from "../../components/MainNavbar";

type FrontendUser = {
  username: string;
  name: string;
  phone: string;
  email: string;
};

export default function UserDashboardPage() {
  const [user, setUser] = useState<FrontendUser | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("we10_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  function handleLogout() {
    window.localStorage.removeItem("we10_user");
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101115]">
      <Header />
      <MainNavbar />
      <section className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <div className="rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#0e7490]">Dashboard User</p>
              <h1 className="mt-2 text-2xl font-bold">Profil Saya</h1>
            </div>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e2ec] px-4 text-sm font-bold text-[#101115] transition hover:bg-[#f8fafc]"
              >
                <LogOut size={18} />
                Keluar
              </button>
            ) : null}
          </div>
          {user ? (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Info label="Nama" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="No hp" value={user.phone} />
            </div>
          ) : (
            <p className="mt-5 text-[#5d6673]">Silakan login dulu dari halaman utama.</p>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d9e2ec] bg-[#f8fafc] p-4">
      <p className="text-sm text-[#5d6673]">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
