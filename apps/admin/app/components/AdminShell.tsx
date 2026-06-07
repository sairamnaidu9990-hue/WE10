"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Admin Management", href: "/dashboard/admin-management", icon: ShieldCheck },
  { label: "Pengguna", href: "/dashboard/users", icon: Users },
  { label: "Game", href: "/dashboard/games", icon: Package },
  { label: "Transaksi", href: "/dashboard/transactions", icon: CreditCard },
  { label: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const adminSession = window.localStorage.getItem("we10_admin");
    const hasAuthCookie = document.cookie
      .split("; ")
      .some((cookie) => cookie === "we10_admin_auth=1");

    if (!adminSession && !hasAuthCookie) {
      router.replace("/");
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem("we10_admin");
    document.cookie = "we10_admin_auth=; path=/; max-age=0; SameSite=Lax";
    router.replace("/");
  }

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101115] text-white">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202126] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/15 border-t-white" />
          <p className="mt-5 text-center text-sm font-semibold text-[#d5d8df]">
            Memeriksa sesi admin...
          </p>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-white" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#101115] text-white">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#18191e] transition-all duration-200 ${
          sidebarOpen ? "w-72 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className={`min-w-0 ${sidebarOpen ? "block" : "hidden"}`}>
            <p className="text-lg font-black">WE10</p>
            <p className="text-xs text-[#a1a8b3]">Admin Panel</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-[#d5d8df] transition hover:bg-white/10 ${
                  isActive ? "bg-white text-black hover:bg-white" : ""
                } ${sidebarOpen ? "justify-start" : "justify-center"}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} />
                <span className={sidebarOpen ? "block" : "hidden"}>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#ff9c90] transition hover:bg-white/10 ${
              sidebarOpen ? "justify-start" : "justify-center"
            }`}
            title={!sidebarOpen ? "Keluar" : undefined}
          >
            <LogOut size={20} />
            <span className={sidebarOpen ? "block" : "hidden"}>Keluar</span>
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup sidebar"
        />
      ) : null}

      <div className={`transition-all duration-200 ${sidebarOpen ? "md:pl-72" : "md:pl-20"}`}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-[#101115]/90 px-5 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-[#202126] text-white transition hover:bg-white/10"
            aria-label={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
            title={sidebarOpen ? "Tutup sidebar" : "Buka sidebar"}
          >
            <Menu size={22} />
          </button>

          <div className="text-right">
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-xs text-[#a1a8b3]">WE10</p>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
