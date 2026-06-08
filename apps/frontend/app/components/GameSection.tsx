"use client";

import type { MouseEvent } from "react";
import { ArrowRight, Package } from "lucide-react";
import { useEffect, useState } from "react";

type Game = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function GameSection() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  function handleGameClick(event: MouseEvent<HTMLAnchorElement>) {
    const storedUser = window.localStorage.getItem("we10_user");

    if (storedUser) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new Event("we10:open-login"));
  }

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch(`${apiUrl}/api/games`);
        const data = await response.json();

        if (response.ok) {
          setGames(data.games);
        }
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#d9e2ec] bg-white/70" />
          ))}
        </div>
      ) : games.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {games.map((game) => (
            <a
              key={game.id}
              href={`/games/${game.slug}`}
              onClick={handleGameClick}
              className="group flex min-h-48 flex-col justify-between rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div>
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#f8fafc]">
                  {game.logoUrl ? (
                    <img className="h-full w-full object-cover" src={game.logoUrl} alt={`${game.name} logo`} />
                  ) : (
                    <Package size={28} className="text-[#0e7490]" />
                  )}
                </div>
                <h2 className="mt-5 text-base font-bold text-[#101115]">{game.name}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5d6673]">
                  {game.shortDescription || "Game sederhana berbasis web siap dimainkan."}
                </p>
              </div>
              <span className="mt-5 flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]">
                Mainkan
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white/70 p-8 text-center text-sm font-semibold text-[#5d6673]">
          Game belum tersedia.
        </div>
      )}
    </section>
  );
}
