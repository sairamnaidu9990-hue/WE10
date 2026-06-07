"use client";

import { ArrowLeft, Package } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Footer from "../../components/Footer";
import Header, { useBrandSettings } from "../../components/Header";
import MainNavbar from "../../components/MainNavbar";

type Game = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function GameDetailPage() {
  const params = useParams<{ slug: string }>();
  const { settings } = useBrandSettings();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(`${apiUrl}/api/games/${params.slug}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Game tidak ditemukan.");
        setGame(data.game);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Game tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      loadGame();
    }
  }, [params.slug]);

  return (
    <main
      className="min-h-screen text-[#101115]"
      style={{ backgroundColor: settings.frontendBackgroundColor }}
    >
      <Header />
      <MainNavbar />

      <section className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <a className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]" href="/">
          <ArrowLeft size={17} />
          Kembali
        </a>

        {loading ? (
          <div className="mt-8 rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-[#d9e2ec]" />
            <div className="mt-6 h-9 w-64 animate-pulse rounded bg-[#d9e2ec]" />
            <div className="mt-4 grid gap-2">
              <div className="h-5 w-full animate-pulse rounded bg-[#d9e2ec]" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-[#d9e2ec]" />
            </div>
          </div>
        ) : game ? (
          <article className="mt-8 rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm md:p-8">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#f8fafc]">
              {game.logoUrl ? (
                <img className="h-full w-full object-cover" src={game.logoUrl} alt={`${game.name} logo`} />
              ) : (
                <Package size={36} className="text-[#0e7490]" />
              )}
            </div>
            <h1 className="mt-6 text-2xl font-bold md:text-4xl">{game.name}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[#5d6673]">
              {game.shortDescription || "Game ini belum memiliki penjelasan."}
            </p>
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbd5e1] bg-white/70 p-8 text-center text-sm font-semibold text-[#5d6673]">
            {message}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
