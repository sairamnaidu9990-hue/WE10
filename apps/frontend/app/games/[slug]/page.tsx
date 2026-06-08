"use client";

import { ArrowLeft, CheckCircle2, Loader2, Package, Play, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useBrandSettings } from "../../components/Header";

type Game = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
};

type LobbyPlayer = {
  id: string;
  name: string;
  ready: boolean;
  order: number;
};

type LobbyState = {
  id: string;
  status: "lobby" | "started";
  minPlayers: number;
  maxPlayers: number;
  playerCount: number;
  readyCount: number;
  canStart: boolean;
  teamCount: number | null;
  startedAt: string | null;
  players: LobbyPlayer[];
};

type FrontendUser = {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function GameDetailPage() {
  const params = useParams<{ slug: string }>();
  const { settings } = useBrandSettings();
  const socketRef = useRef<Socket | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<FrontendUser | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isReadying, setIsReadying] = useState(false);
  const [lobby, setLobby] = useState<LobbyState | null>(null);

  useEffect(() => {
    const storedUser = window.localStorage.getItem("we10_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setPlayerName(parsedUser.username || "");
      } catch {
        window.localStorage.removeItem("we10_user");
        setUser(null);
        setPlayerName("");
      }
    }

    setAuthChecked(true);
  }, []);

  useEffect(() => {
    const socket = io(apiUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.on("konami:lobby-state", (state: LobbyState) => {
      setLobby(state);
    });

    return () => {
      socket.emit("konami:leave");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

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

  function joinLobby() {
    if (!socketRef.current || !params.slug) return;
    if (!user) {
      setMessage("Silakan login dulu sebelum masuk lobby.");
      return;
    }

    setIsJoining(true);
    setMessage("");
    socketRef.current.emit(
      "konami:join",
      {
        roomId: params.slug,
        gameSlug: params.slug,
        playerName: user.username,
        userId: user.id,
        username: user.username,
      },
      (response: { ok: boolean; message?: string; playerId?: string }) => {
        setIsJoining(false);
        if (!response.ok) {
          setMessage(response.message || "Gagal masuk lobby.");
          return;
        }

        setPlayerId(response.playerId || "");
      },
    );
  }

  function markReady() {
    if (!socketRef.current) return;

    setIsReadying(true);
    setMessage("");
    socketRef.current.emit(
      "konami:ready",
      { roomId: params.slug },
      (response: { ok: boolean; message?: string }) => {
        setIsReadying(false);
        if (!response.ok) {
          setMessage(response.message || "Gagal mulai.");
        }
      },
    );
  }

  const currentPlayer = lobby?.players.find((player) => player.id === playerId);
  const needsMorePlayers = lobby ? Math.max(lobby.minPlayers - lobby.playerCount, 0) : 0;
  const isAuthLoading = !authChecked;

  return (
    <main
      className="min-h-screen text-[#101115]"
      style={{ backgroundColor: settings.frontendBackgroundColor }}
    >
      <section className="mx-auto max-w-5xl px-5 py-6 md:px-8">
        <a
          className="fixed left-4 top-4 z-30 inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9e2ec] bg-white/90 px-4 text-xs font-bold uppercase text-[#0e7490] shadow-sm backdrop-blur transition hover:bg-white"
          href="/"
        >
          <ArrowLeft size={17} />
          Keluar
        </a>

        {loading || isAuthLoading ? (
          <div className="mt-16 rounded-2xl border border-[#d9e2ec] bg-white p-6 shadow-sm">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-[#d9e2ec]" />
            <div className="mt-6 h-9 w-64 animate-pulse rounded bg-[#d9e2ec]" />
            <div className="mt-4 grid gap-2">
              <div className="h-5 w-full animate-pulse rounded bg-[#d9e2ec]" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-[#d9e2ec]" />
            </div>
          </div>
        ) : !user ? (
          <div className="mt-16 rounded-2xl border border-[#d9e2ec] bg-white p-6 text-center shadow-sm md:p-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#f8fafc] text-[#0e7490]">
              <Users size={28} />
            </div>
            <h1 className="mt-5 text-xl font-bold">Login diperlukan</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5d6673]">
              Kamu harus login terlebih dahulu sebelum masuk lobby dan memainkan Konami Cup WE10.
            </p>
            <a
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#101115] px-5 text-sm font-bold text-white"
              href="/"
            >
              Kembali ke halaman utama
            </a>
          </div>
        ) : game ? (
          <article className="mt-16 grid gap-5 rounded-2xl border border-[#d9e2ec] bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[#d9e2ec] bg-[#f8fafc]">
                  {game.logoUrl ? (
                    <img className="h-full w-full object-cover" src={game.logoUrl} alt={`${game.name} logo`} />
                  ) : (
                    <Package size={28} className="text-[#0e7490]" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-[#0e7490]">Konami Cup WE10</p>
                  <h1 className="mt-1 text-xl font-bold md:text-2xl">{game.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d6673]">
                    {game.shortDescription || "Lobby simulasi game berbasis web."}
                  </p>
                </div>
              </div>

              {lobby?.status === "started" ? (
                <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#dcfce7] px-4 text-xs font-bold uppercase text-[#166534]">
                  <CheckCircle2 size={16} />
                  Game Dimulai
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[320px_1fr]">
              <section className="rounded-2xl border border-[#d9e2ec] bg-[#f8fafc] p-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#0e7490]" />
                  <h2 className="text-sm font-bold">Masuk Lobby</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#5d6673]">
                  Minimal 3 player, maksimal 10 player. Semua player harus klik Mulai.
                </p>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-bold uppercase text-[#5d6673]">Nama Player</span>
                  <input
                    value={playerName}
                    readOnly
                    className="h-11 w-full rounded-xl border border-[#d9e2ec] bg-white px-4 text-sm font-semibold outline-none"
                    placeholder="Username"
                  />
                </label>

                {!currentPlayer ? (
                  <button
                    type="button"
                    onClick={joinLobby}
                    disabled={!user.username || isJoining || lobby?.status === "started"}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#101115] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isJoining ? <Loader2 size={17} className="animate-spin" /> : <Users size={17} />}
                    Masuk Lobby
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={markReady}
                    disabled={currentPlayer.ready || isReadying || Boolean(needsMorePlayers)}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0e7490] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isReadying ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
                    {currentPlayer.ready ? "Sudah Mulai" : "Mulai"}
                  </button>
                )}

                <p className="mt-3 min-h-5 text-xs font-semibold text-[#dc2626]">{message}</p>
              </section>

              <section className="rounded-2xl border border-[#d9e2ec] bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Lobby Player</h2>
                    <p className="mt-1 text-xs text-[#5d6673]">
                      {lobby ? `${lobby.playerCount}/${lobby.maxPlayers} player, ${lobby.readyCount} sudah mulai` : "Menunggu koneksi lobby..."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#d9e2ec] bg-[#f8fafc] px-3 py-2 text-xs font-bold text-[#101115]">
                    {lobby?.status === "started"
                      ? `Team tersedia: ${lobby.teamCount}`
                      : needsMorePlayers > 0
                        ? `Butuh ${needsMorePlayers} player lagi`
                        : "Siap menunggu semua mulai"}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {lobby?.players.length ? (
                    lobby.players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-xl border border-[#d9e2ec] bg-[#f8fafc] px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-xs font-bold text-[#0e7490]">
                            {player.order}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{player.name}</p>
                            <p className="text-xs text-[#5d6673]">{player.id === playerId ? "Kamu" : "Player"}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            player.ready ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
                          }`}
                        >
                          {player.ready ? "Ready" : "Waiting"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#cbd5e1] p-8 text-center text-sm text-[#5d6673]">
                      Belum ada player di lobby.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbd5e1] bg-white/70 p-8 text-center text-sm font-semibold text-[#5d6673]">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}
