"use client";

import { useEffect, useState } from "react";
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

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#101115]">
      <Header />
      <MainNavbar />
      <section className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <div className="rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-[#0e7490]">Dashboard User</p>
          <h1 className="mt-2 text-3xl font-black">Profil Saya</h1>
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
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#d9e2ec] bg-[#f8fafc] p-4">
      <p className="text-sm text-[#5d6673]">{label}</p>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}
