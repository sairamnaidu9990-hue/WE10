"use client";

import { ArrowLeft, CheckCircle2, GitBranch, Loader2, Package, Play, Shuffle, Trophy, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import GameArena3D from "../../components/GameArena3D";

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

type LobbyPlayer = {
  id: string;
  name: string;
  ready: boolean;
  order: number;
  assignedTeam: AssignedTeam | null;
};

type AssignedTeam = {
  id: string;
  name: string;
};

type BracketSide = {
  playerId: string;
  name: string;
  order: number;
  team: AssignedTeam | null;
};

type BracketMatch = {
  match: number;
  sideA: BracketSide | null;
  sideB: BracketSide | null;
};

type LobbyState = {
  id: string;
  lobbyName: string;
  status: "lobby" | "started";
  minPlayers: number;
  maxPlayers: number;
  playerCount: number;
  readyCount: number;
  canStart: boolean;
  teamCount: number | null;
  availableTeams: AssignedTeam[];
  bracket: BracketMatch[];
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
    <main className="relative min-h-screen overflow-hidden bg-[#05080c] text-white">
      <GameArena3D />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(8,47,73,0.08),rgba(5,8,12,0.72)_74%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-5 md:px-8">
        <a
          className="fixed left-4 top-4 z-30 inline-flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-[#07111b]/80 px-4 text-xs font-bold uppercase text-[#e0f2fe] shadow-[0_0_30px_rgba(14,165,233,0.18)] backdrop-blur transition hover:bg-[#0b1724]"
          href="/"
        >
          <ArrowLeft size={17} />
          Keluar
        </a>

        {loading || isAuthLoading ? (
          <div className="mt-16 rounded-2xl border border-white/15 bg-[#07111b]/82 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-white/15" />
            <div className="mt-6 h-9 w-64 animate-pulse rounded bg-white/15" />
            <div className="mt-4 grid gap-2">
              <div className="h-5 w-full animate-pulse rounded bg-white/15" />
              <div className="h-5 w-4/5 animate-pulse rounded bg-white/15" />
            </div>
          </div>
        ) : !user ? (
          <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/15 bg-[#07111b]/86 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
              <Users size={28} />
            </div>
            <h1 className="mt-5 text-xl font-bold">Login diperlukan</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
              Kamu harus login terlebih dahulu sebelum masuk lobby dan memainkan Konami Cup WE10.
            </p>
            <a
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 text-sm font-bold text-[#06111a]"
              href="/"
            >
              Kembali ke halaman utama
            </a>
          </div>
        ) : game ? (
          <article className="mt-16 grid gap-5 rounded-2xl border border-white/15 bg-[#07111b]/76 p-4 shadow-[0_28px_100px_rgba(0,0,0,0.48)] backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-cyan-300/25 bg-white/10 shadow-[0_0_35px_rgba(34,211,238,0.2)]">
                  {game.logoUrl ? (
                    <img className="h-full w-full object-cover" src={game.logoUrl} alt={`${game.name} logo`} />
                  ) : (
                    <Package size={28} className="text-cyan-200" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-cyan-200">
                    {lobby?.lobbyName || game.lobbyName || "Konami Cup WE10"}
                  </p>
                  <h1 className="mt-1 text-xl font-bold md:text-2xl">{game.name}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    {game.shortDescription || "Lobby simulasi game berbasis web."}
                  </p>
                </div>
              </div>

              {lobby?.status === "started" ? (
                <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/14 px-4 text-xs font-bold uppercase text-emerald-200">
                  <CheckCircle2 size={16} />
                  Game Dimulai
                </span>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[320px_1fr]">
              <section className="rounded-2xl border border-white/12 bg-[#0b1520]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-cyan-200" />
                  <h2 className="text-sm font-bold">Masuk Lobby</h2>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Minimal {lobby?.minPlayers || game.minPlayers || 3} player, maksimal{" "}
                  {lobby?.maxPlayers || game.maxPlayers || 10} player. Semua player harus klik Mulai.
                </p>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-bold uppercase text-slate-300">Nama Player</span>
                  <input
                    value={playerName}
                    readOnly
                    className="h-11 w-full rounded-lg border border-white/15 bg-black/26 px-4 text-sm font-semibold text-white outline-none"
                    placeholder="Username"
                  />
                </label>

                {!currentPlayer ? (
                  <button
                    type="button"
                    onClick={joinLobby}
                    disabled={!user.username || isJoining || lobby?.status === "started"}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 text-sm font-bold text-[#06111a] shadow-[0_0_28px_rgba(34,211,238,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isJoining ? <Loader2 size={17} className="animate-spin" /> : <Users size={17} />}
                    Masuk Lobby
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={markReady}
                    disabled={currentPlayer.ready || isReadying || Boolean(needsMorePlayers)}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-300 text-sm font-bold text-[#06111a] shadow-[0_0_28px_rgba(52,211,153,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isReadying ? <Loader2 size={17} className="animate-spin" /> : <Play size={17} />}
                    {currentPlayer.ready ? "Sudah Mulai" : "Mulai"}
                  </button>
                )}

                <p className="mt-3 min-h-5 text-xs font-semibold text-rose-300">{message}</p>
              </section>

              <section className="rounded-2xl border border-white/12 bg-[#0b1520]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold">Lobby Player</h2>
                    <p className="mt-1 text-xs text-slate-300">
                      {lobby ? `${lobby.playerCount}/${lobby.maxPlayers} player, ${lobby.readyCount} sudah mulai` : "Menunggu koneksi lobby..."}
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100">
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
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/24 px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-bold text-cyan-200">
                            {player.order}
                          </span>
                          <div>
                            <p className="text-sm font-semibold">{player.name}</p>
                            <p className="text-xs text-slate-300">
                              {player.assignedTeam?.name || (player.id === playerId ? "Kamu" : "Player")}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            player.ready ? "bg-emerald-300/15 text-emerald-200" : "bg-rose-300/15 text-rose-200"
                          }`}
                        >
                          {player.ready ? "Ready" : "Waiting"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-slate-300">
                      Belum ada player di lobby.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {lobby?.status === "started" ? (
              <section className="grid gap-4 md:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl border border-white/12 bg-[#0b1520]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-2">
                    <Shuffle size={18} className="text-cyan-200" />
                    <h2 className="text-sm font-bold">Random Team</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Daftar peserta {lobby.lobbyName} berdasarkan nomor urut player.
                  </p>

                  <div className="mt-4 grid gap-2">
                    {lobby.players.map((player) => (
                      <div
                        key={`team-${player.id}`}
                        className="grid grid-cols-[42px_1fr] items-center gap-3 rounded-xl border border-white/10 bg-black/24 px-3 py-3"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-xs font-bold text-cyan-200">
                          {player.order}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{player.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-300">
                            <Trophy size={13} className="text-cyan-200" />
                            {player.assignedTeam?.name || "Team belum dipilih"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/12 bg-[#0b1520]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <div className="flex items-center gap-2">
                    <GitBranch size={18} className="text-cyan-200" />
                    <h2 className="text-sm font-bold">Bracket</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-300">
                    Placeholder bracket awal, pertandingan dibuat dari nomor urut player.
                  </p>

                  <div className="mt-4 grid gap-3">
                    {lobby.bracket.map((match) => (
                      <div key={match.match} className="rounded-xl border border-white/10 bg-black/24 p-3">
                        <p className="mb-3 text-xs font-bold uppercase text-slate-300">Match {match.match}</p>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <BracketSideCard side={match.sideA} fallback="A" />
                          <span className="text-xs font-black text-cyan-200">VS</span>
                          <BracketSideCard side={match.sideB} fallback="BYE" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-[#07111b]/82 p-8 text-center text-sm font-semibold text-slate-300 backdrop-blur-xl">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}

function BracketSideCard({ side, fallback }: { side: BracketSide | null; fallback: string }) {
  return (
    <div className="min-h-20 rounded-xl border border-white/10 bg-[#07111b]/78 p-3">
      {side ? (
        <>
          <p className="text-xs font-bold text-cyan-200">#{side.order}</p>
          <p className="mt-1 truncate text-sm font-bold">{side.team?.name || fallback}</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-300">{side.name}</p>
        </>
      ) : (
        <div className="grid min-h-14 place-items-center text-xs font-bold uppercase text-slate-400">{fallback}</div>
      )}
    </div>
  );
}
