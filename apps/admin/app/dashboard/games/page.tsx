"use client";

import { FormEvent, useEffect, useState } from "react";
import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import AdminShell from "../../components/AdminShell";

type Game = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
  minPlayers: number;
  maxPlayers: number;
  lobbyName: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    logoUrl: "",
    shortDescription: "",
    minPlayers: "3",
    maxPlayers: "10",
    lobbyName: "Konami Cup National",
  });

  async function loadGames() {
    try {
      const response = await fetch(`${apiUrl}/api/admin/games`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal memuat game.");
      setGames(data.games);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal memuat game.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menambahkan game.");
      setGames((current) => [data.game, ...current]);
      setForm({
        name: "",
        logoUrl: "",
        shortDescription: "",
        minPlayers: "3",
        maxPlayers: "10",
        lobbyName: "Konami Cup National",
      });
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menambahkan game.");
    }
  }

  async function saveGame(game: Game) {
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menyimpan game.");
      setGames((current) =>
        current.map((item) => (item.id === game.id ? data.game : item)),
      );
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menyimpan game.");
    }
  }

  async function deleteGame(gameId: string) {
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/api/admin/games/${gameId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Gagal menghapus game.");
      setGames((current) => current.filter((game) => game.id !== gameId));
      setMessage(data.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal menghapus game.");
    }
  }

  function updateGame(gameId: string, field: keyof Game, value: string | number) {
    setGames((current) =>
      current.map((game) =>
        game.id === gameId ? { ...game, [field]: value } : game,
      ),
    );
  }

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase text-[#a1a8b3]">WE10 Admin</p>
          <h1 className="mt-2 text-3xl font-bold">Game</h1>
          <p className="mt-2 text-sm text-[#a1a8b3]">
            Atur logo, nama, dan penjelasan singkat game yang tampil di frontend.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="grid gap-4 rounded-2xl border border-white/10 bg-[#202126] p-5"
        >
          <h2 className="text-xl font-bold">Tambah Game</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Nama Game</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Nama game"
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Logo URL</span>
              <input
                value={form.logoUrl}
                onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="https://.../logo.png"
              />
            </label>
          </div>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Penjelasan Singkat</span>
            <textarea
              value={form.shortDescription}
              onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))}
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#2a2b31] p-4 outline-none focus:border-white/30"
              placeholder="Tuliskan penjelasan singkat game"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Minimal Player</span>
              <input
                value={form.minPlayers}
                onChange={(event) => setForm((current) => ({ ...current, minPlayers: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                inputMode="numeric"
                placeholder="3"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Maksimal Player</span>
              <input
                value={form.maxPlayers}
                onChange={(event) => setForm((current) => ({ ...current, maxPlayers: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                inputMode="numeric"
                placeholder="10"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-[#d5d8df]">Room Lobby</span>
              <input
                value={form.lobbyName}
                onChange={(event) => setForm((current) => ({ ...current, lobbyName: event.target.value }))}
                className="h-12 w-full rounded-xl border border-white/10 bg-[#2a2b31] px-4 outline-none focus:border-white/30"
                placeholder="Konami Cup National"
              />
            </label>
          </div>
          <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-black md:w-fit">
            <Plus size={18} />
            Tambah Game
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#202126] p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Daftar Game</h2>
            <p className="text-sm text-[#a1d99b]" role="status">
              {loading ? "Memuat game..." : message}
            </p>
          </div>

          <div className="grid gap-4">
            {games.map((game) => (
              <div key={game.id} className="grid gap-4 rounded-2xl border border-white/10 bg-[#18191e] p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {game.logoUrl ? (
                      <img className="h-full w-full object-cover" src={game.logoUrl} alt="" />
                    ) : (
                      <span className="text-2xl font-black">{game.name.charAt(0) || "G"}</span>
                    )}
                  </div>

                  <div className="grid flex-1 gap-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={game.name}
                        onChange={(event) => updateGame(game.id, "name", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        placeholder="Nama game"
                      />
                      <input
                        value={game.logoUrl}
                        onChange={(event) => updateGame(game.id, "logoUrl", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        placeholder="Logo URL"
                      />
                    </div>
                    <textarea
                      value={game.shortDescription}
                      onChange={(event) => updateGame(game.id, "shortDescription", event.target.value)}
                      className="min-h-24 rounded-xl border border-white/10 bg-[#2a2b31] p-4 text-sm outline-none focus:border-white/30"
                      placeholder="Penjelasan singkat"
                    />
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        value={game.minPlayers}
                        onChange={(event) => updateGame(game.id, "minPlayers", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        inputMode="numeric"
                        placeholder="Minimal player"
                      />
                      <input
                        value={game.maxPlayers}
                        onChange={(event) => updateGame(game.id, "maxPlayers", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        inputMode="numeric"
                        placeholder="Maksimal player"
                      />
                      <input
                        value={game.lobbyName}
                        onChange={(event) => updateGame(game.id, "lobbyName", event.target.value)}
                        className="h-11 rounded-xl border border-white/10 bg-[#2a2b31] px-4 text-sm outline-none focus:border-white/30"
                        placeholder="Room lobby"
                      />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => saveGame(game)}
                        className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black"
                      >
                        <Save size={16} />
                        Simpan
                      </button>
                      <a
                        className="flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-[#d5d8df]"
                        href={`${frontendUrl}/games/${game.slug}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={16} />
                        Lihat
                      </a>
                      <button
                        type="button"
                        onClick={() => deleteGame(game.id)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-[#ff9c90]/30 px-4 text-sm font-bold text-[#ff9c90]"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!loading && games.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-[#a1a8b3]">
                Belum ada game.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
