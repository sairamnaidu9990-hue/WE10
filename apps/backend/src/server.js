require("dotenv").config();

const cors = require("cors");
const bcrypt = require("bcryptjs");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { connectDatabase } = require("./db");
const AdminUser = require("./models/adminUser");
const BrandSettings = require("./models/brandSettings");
const Product = require("./models/product");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const konamiRooms = new Map();
const konamiTeamPool = [
  { id: "argentina", name: "Argentina" },
  { id: "brazil", name: "Brazil" },
  { id: "france", name: "France" },
  { id: "germany", name: "Germany" },
  { id: "italy", name: "Italy" },
  { id: "spain", name: "Spain" },
  { id: "england", name: "England" },
  { id: "portugal", name: "Portugal" },
  { id: "netherlands", name: "Netherlands" },
  { id: "belgium", name: "Belgium" },
  { id: "japan", name: "Japan" },
  { id: "korea-republic", name: "Korea Republic" },
  { id: "uruguay", name: "Uruguay" },
  { id: "croatia", name: "Croatia" },
];

app.use(cors());
app.use(express.json());

async function getGameLobbySettings(roomId) {
  const game = await Product.findOne({ slug: String(roomId || "").trim().toLowerCase() });
  const minPlayers = Math.min(Math.max(Number(game?.minPlayers) || 3, 1), 10);
  const maxPlayers = Math.min(Math.max(Number(game?.maxPlayers) || 10, minPlayers), 10);

  return {
    minPlayers,
    maxPlayers,
    lobbyName: game?.lobbyName || "Konami Cup National",
  };
}

function applyKonamiRoomSettings(room, settings) {
  room.lobbyName = settings.lobbyName;
  room.minPlayers = settings.minPlayers;
  room.maxPlayers = settings.maxPlayers;
}

async function getKonamiRoom(roomId) {
  if (!konamiRooms.has(roomId)) {
    const settings = await getGameLobbySettings(roomId);

    konamiRooms.set(roomId, {
      id: roomId,
      lobbyName: settings.lobbyName,
      status: "lobby",
      minPlayers: settings.minPlayers,
      maxPlayers: settings.maxPlayers,
      players: new Map(),
      startedAt: null,
      teamCount: null,
      availableTeams: [],
      bracket: [],
    });
  }

  return konamiRooms.get(roomId);
}

async function refreshKonamiRoomSettings(room) {
  if (room.status !== "lobby") return room;

  const settings = await getGameLobbySettings(room.id);
  applyKonamiRoomSettings(room, settings);
  return room;
}

function formatKonamiRoom(room) {
  const players = Array.from(room.players.values()).sort((a, b) => a.order - b.order);
  const readyCount = players.filter((player) => player.ready).length;

  return {
    id: room.id,
    lobbyName: room.lobbyName,
    status: room.status,
    minPlayers: room.minPlayers,
    maxPlayers: room.maxPlayers,
    playerCount: players.length,
    readyCount,
    canStart: players.length >= room.minPlayers && readyCount === players.length,
    teamCount: room.teamCount,
    availableTeams: room.availableTeams,
    bracket: room.bracket,
    startedAt: room.startedAt,
    players,
  };
}

function emitKonamiRoom(room) {
  io.to(room.id).emit("konami:lobby-state", formatKonamiRoom(room));
}

function startKonamiRoom(room) {
  const players = Array.from(room.players.values()).sort((a, b) => a.order - b.order);
  room.status = "started";
  room.startedAt = new Date().toISOString();
  room.teamCount = players.length < 5 ? 10 : 14;
  room.availableTeams = shuffleItems(konamiTeamPool).slice(0, room.teamCount);

  players.forEach((player, index) => {
    player.order = index + 1;
    player.ready = true;
    player.assignedTeam = room.availableTeams[index] || null;
  });

  room.bracket = createKonamiBracket(players);
}

function shuffleItems(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function formatBracketSide(player) {
  if (!player) return null;

  return {
    playerId: player.id,
    name: player.name,
    order: player.order,
    team: player.assignedTeam,
  };
}

function createKonamiBracket(players) {
  const bracket = [];

  for (let index = 0; index < players.length; index += 2) {
    bracket.push({
      match: bracket.length + 1,
      sideA: formatBracketSide(players[index]),
      sideB: formatBracketSide(players[index + 1]),
    });
  }

  return bracket;
}

io.on("connection", (socket) => {
  socket.on("konami:join", async (payload = {}, callback) => {
    const roomId = String(payload.roomId || payload.gameSlug || "konami-cup").trim().toLowerCase();
    const username = String(payload.username || payload.playerName || "").trim().toLowerCase().slice(0, 24);
    const userId = String(payload.userId || "").trim();

    if (!username) {
      callback?.({ ok: false, message: "Login diperlukan sebelum masuk lobby." });
      return;
    }

    const room = await refreshKonamiRoomSettings(await getKonamiRoom(roomId));

    if (room.status !== "lobby") {
      callback?.({ ok: false, message: "Game sudah berjalan." });
      socket.emit("konami:lobby-state", formatKonamiRoom(room));
      return;
    }

    if (!room.players.has(socket.id) && room.players.size >= room.maxPlayers) {
      callback?.({ ok: false, message: "Lobby sudah penuh." });
      socket.emit("konami:lobby-state", formatKonamiRoom(room));
      return;
    }

    socket.join(room.id);
    socket.data.konamiRoomId = room.id;
    room.players.set(socket.id, {
      id: socket.id,
      userId,
      name: username,
      ready: false,
      order: room.players.size + 1,
    });

    callback?.({ ok: true, playerId: socket.id });
    emitKonamiRoom(room);
  });

  socket.on("konami:ready", async (payload = {}, callback) => {
    const roomId = socket.data.konamiRoomId || String(payload.roomId || "konami-cup");
    const room = await getKonamiRoom(roomId);
    const player = room.players.get(socket.id);

    if (!player) {
      callback?.({ ok: false, message: "Player belum masuk lobby." });
      return;
    }

    if (room.status !== "lobby") {
      callback?.({ ok: false, message: "Game sudah berjalan." });
      return;
    }

    player.ready = true;

    if (room.players.size >= room.minPlayers && Array.from(room.players.values()).every((item) => item.ready)) {
      startKonamiRoom(room);
    }

    callback?.({ ok: true });
    emitKonamiRoom(room);
  });

  socket.on("konami:leave", () => {
    const roomId = socket.data.konamiRoomId;
    if (!roomId) return;

    const room = konamiRooms.get(roomId);
    if (!room) return;

    room.players.delete(socket.id);
    socket.leave(roomId);
    socket.data.konamiRoomId = null;

    Array.from(room.players.values())
      .sort((a, b) => a.order - b.order)
      .forEach((player, index) => {
        player.order = index + 1;
      });

    emitKonamiRoom(room);
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.konamiRoomId;
    if (!roomId) return;

    const room = konamiRooms.get(roomId);
    if (!room) return;

    room.players.delete(socket.id);
    Array.from(room.players.values())
      .sort((a, b) => a.order - b.order)
      .forEach((player, index) => {
        player.order = index + 1;
      });

    emitKonamiRoom(room);
  });
});

app.get("/", (req, res) => {
  res.json({
    app: "WE10 Backend",
    status: "ok",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: "connected",
  });
});

function formatBrandSettings(settings) {
  return {
    brandName: settings.brandName,
    frontendTitle: settings.frontendTitle,
    frontendDescription: settings.frontendDescription,
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    domain: settings.domain,
    headerBackgroundColor: settings.headerBackgroundColor,
    headerTextColor: settings.headerTextColor,
    headerAccentColor: settings.headerAccentColor,
    frontendBackgroundColor: settings.frontendBackgroundColor,
    bannerEnabled: settings.bannerEnabled,
    bannerImageUrl: settings.bannerImageUrl,
    bannerImageFit: settings.bannerImageFit,
    bannerTitle: settings.bannerTitle,
    bannerSubtitle: settings.bannerSubtitle,
    bannerLink: settings.bannerLink,
    bannerBackgroundColor: settings.bannerBackgroundColor,
    bannerDesktopHeight: settings.bannerDesktopHeight,
    bannerMobileHeight: settings.bannerMobileHeight,
    footerEnabled: settings.footerEnabled,
    footerTitle: settings.footerTitle,
    footerDescription: settings.footerDescription,
    footerCopyright: settings.footerCopyright,
    footerBackgroundColor: settings.footerBackgroundColor,
    footerTextColor: settings.footerTextColor,
    footerLinkOneLabel: settings.footerLinkOneLabel,
    footerLinkOneUrl: settings.footerLinkOneUrl,
    footerLinkTwoLabel: settings.footerLinkTwoLabel,
    footerLinkTwoUrl: settings.footerLinkTwoUrl,
    footerLinkThreeLabel: settings.footerLinkThreeLabel,
    footerLinkThreeUrl: settings.footerLinkThreeUrl,
  };
}

async function getBrandSettings() {
  let settings = await BrandSettings.findOne();

  if (!settings) {
    settings = await BrandSettings.create({});
  }

  return settings;
}

app.get("/api/brand-settings", async (req, res) => {
  try {
    const settings = await getBrandSettings();

    return res.json({
      settings: formatBrandSettings(settings),
    });
  } catch (error) {
    console.error("Failed to load brand settings:", error.message);

    return res.status(500).json({
      message: "Gagal memuat pengaturan brand.",
    });
  }
});

app.put("/api/admin/brand-settings", async (req, res) => {
  try {
    const settings = await getBrandSettings();
    const allowedFields = [
      "brandName",
      "frontendTitle",
      "frontendDescription",
      "logoUrl",
      "faviconUrl",
      "domain",
      "headerBackgroundColor",
      "headerTextColor",
      "headerAccentColor",
      "frontendBackgroundColor",
      "bannerImageUrl",
      "bannerImageFit",
      "bannerTitle",
      "bannerSubtitle",
      "bannerLink",
      "bannerBackgroundColor",
      "bannerDesktopHeight",
      "bannerMobileHeight",
      "footerTitle",
      "footerDescription",
      "footerCopyright",
      "footerBackgroundColor",
      "footerTextColor",
      "footerLinkOneLabel",
      "footerLinkOneUrl",
      "footerLinkTwoLabel",
      "footerLinkTwoUrl",
      "footerLinkThreeLabel",
      "footerLinkThreeUrl",
    ];

    for (const field of allowedFields) {
      if (typeof req.body[field] === "string") {
        settings[field] = req.body[field].trim();
      }
    }

    if (typeof req.body.bannerEnabled === "boolean") {
      settings.bannerEnabled = req.body.bannerEnabled;
    }

    if (typeof req.body.footerEnabled === "boolean") {
      settings.footerEnabled = req.body.footerEnabled;
    }

    await settings.save();

    return res.json({
      message: "Pengaturan brand berhasil disimpan.",
      settings: formatBrandSettings(settings),
    });
  } catch (error) {
    console.error("Failed to save brand settings:", error.message);

    return res.status(500).json({
      message: "Gagal menyimpan pengaturan brand.",
    });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const normalizedUsername = username.includes("@") ? username.split("@")[0] : username;
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({
        message: "Username dan password wajib diisi.",
      });
    }

    const admin = await AdminUser.findOne({ username: normalizedUsername });

    if (!admin) {
      return res.status(401).json({
        message: "Username atau password salah.",
      });
    }

    if (admin.isSuspended) {
      return res.status(403).json({
        message: "Akun admin sedang disuspend.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Username atau password salah.",
      });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    return res.json({
      message: "Login successful",
      admin: {
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error.message);

    return res.status(500).json({
      message: "Server gagal memproses login.",
    });
  }
});

function formatUser(user) {
  return {
    id: user._id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    email: user.email,
    isSuspended: user.isSuspended,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatProduct(product) {
  return {
    id: product._id,
    name: product.name,
    slug: product.slug,
    logoUrl: product.logoUrl,
    shortDescription: product.shortDescription,
    minPlayers: product.minPlayers,
    maxPlayers: product.maxPlayers,
    lobbyName: product.lobbyName,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function normalizeGameLobbySettings(body) {
  const minPlayers = Math.min(Math.max(Number(body.minPlayers) || 3, 1), 10);
  const maxPlayers = Math.min(Math.max(Number(body.maxPlayers) || 10, minPlayers), 10);

  return {
    minPlayers,
    maxPlayers,
    lobbyName: String(body.lobbyName || "Konami Cup National").trim(),
  };
}

async function makeUniqueProductSlug(name, currentId) {
  const baseSlug = createSlug(name) || "product";
  let slug = baseSlug;
  let counter = 2;

  while (await Product.findOne({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products: products.map(formatProduct) });
  } catch (error) {
    console.error("Failed to load products:", error.message);
    return res.status(500).json({ message: "Gagal memuat produk." });
  }
});

app.get("/api/games", async (req, res) => {
  try {
    const games = await Product.find().sort({ createdAt: -1 });
    return res.json({ games: games.map(formatProduct) });
  } catch (error) {
    console.error("Failed to load games:", error.message);
    return res.status(500).json({ message: "Gagal memuat game." });
  }
});

app.get("/api/products/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan." });

    return res.json({ product: formatProduct(product) });
  } catch (error) {
    console.error("Failed to load product:", error.message);
    return res.status(500).json({ message: "Gagal memuat detail produk." });
  }
});

app.get("/api/games/:slug", async (req, res) => {
  try {
    const game = await Product.findOne({ slug: req.params.slug });
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan." });

    return res.json({ game: formatProduct(game) });
  } catch (error) {
    console.error("Failed to load game:", error.message);
    return res.status(500).json({ message: "Gagal memuat detail game." });
  }
});

app.get("/api/admin/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json({ products: products.map(formatProduct) });
  } catch (error) {
    console.error("Failed to load admin products:", error.message);
    return res.status(500).json({ message: "Gagal memuat produk." });
  }
});

app.get("/api/admin/games", async (req, res) => {
  try {
    const games = await Product.find().sort({ createdAt: -1 });
    return res.json({ games: games.map(formatProduct) });
  } catch (error) {
    console.error("Failed to load admin games:", error.message);
    return res.status(500).json({ message: "Gagal memuat game." });
  }
});

app.post("/api/admin/products", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const logoUrl = String(req.body.logoUrl || "").trim();
    const shortDescription = String(req.body.shortDescription || "").trim();
    const lobbySettings = normalizeGameLobbySettings(req.body);

    if (!name) {
      return res.status(400).json({ message: "Nama produk wajib diisi." });
    }

    const product = await Product.create({
      name,
      slug: await makeUniqueProductSlug(name),
      logoUrl,
      shortDescription,
      ...lobbySettings,
    });

    return res.status(201).json({
      message: "Produk berhasil ditambahkan.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("Failed to create product:", error.message);
    return res.status(500).json({ message: "Gagal menambahkan produk." });
  }
});

app.post("/api/admin/games", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const logoUrl = String(req.body.logoUrl || "").trim();
    const shortDescription = String(req.body.shortDescription || "").trim();
    const lobbySettings = normalizeGameLobbySettings(req.body);

    if (!name) {
      return res.status(400).json({ message: "Nama game wajib diisi." });
    }

    const game = await Product.create({
      name,
      slug: await makeUniqueProductSlug(name),
      logoUrl,
      shortDescription,
      ...lobbySettings,
    });

    return res.status(201).json({
      message: "Game berhasil ditambahkan.",
      game: formatProduct(game),
    });
  } catch (error) {
    console.error("Failed to create game:", error.message);
    return res.status(500).json({ message: "Gagal menambahkan game." });
  }
});

app.patch("/api/admin/products/:id", async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }
    if (typeof req.body.logoUrl === "string") {
      updates.logoUrl = req.body.logoUrl.trim();
    }
    if (typeof req.body.shortDescription === "string") {
      updates.shortDescription = req.body.shortDescription.trim();
    }
    Object.assign(updates, normalizeGameLobbySettings(req.body));

    if (!updates.name) {
      return res.status(400).json({ message: "Nama produk wajib diisi." });
    }

    updates.slug = await makeUniqueProductSlug(updates.name, req.params.id);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan." });

    return res.json({
      message: "Produk berhasil disimpan.",
      product: formatProduct(product),
    });
  } catch (error) {
    console.error("Failed to update product:", error.message);
    return res.status(500).json({ message: "Gagal menyimpan produk." });
  }
});

app.patch("/api/admin/games/:id", async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }
    if (typeof req.body.logoUrl === "string") {
      updates.logoUrl = req.body.logoUrl.trim();
    }
    if (typeof req.body.shortDescription === "string") {
      updates.shortDescription = req.body.shortDescription.trim();
    }
    Object.assign(updates, normalizeGameLobbySettings(req.body));

    if (!updates.name) {
      return res.status(400).json({ message: "Nama game wajib diisi." });
    }

    updates.slug = await makeUniqueProductSlug(updates.name, req.params.id);

    const game = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan." });

    return res.json({
      message: "Game berhasil disimpan.",
      game: formatProduct(game),
    });
  } catch (error) {
    console.error("Failed to update game:", error.message);
    return res.status(500).json({ message: "Gagal menyimpan game." });
  }
});

app.delete("/api/admin/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Produk tidak ditemukan." });

    return res.json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete product:", error.message);
    return res.status(500).json({ message: "Gagal menghapus produk." });
  }
});

app.post("/api/users/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const name = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!username || !password || !name || !phone || !email) {
      return res.status(400).json({ message: "Semua data wajib diisi." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter." });
    }

    const duplicate = await User.findOne({
      $or: [{ username }, { phone }, { email }],
    });

    if (duplicate) {
      if (duplicate.username === username) {
        return res.status(409).json({ message: "Username sudah terdaftar." });
      }
      if (duplicate.phone === phone) {
        return res.status(409).json({ message: "No hp sudah terdaftar." });
      }
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, passwordHash, name, phone, email });

    return res.status(201).json({
      message: "Daftar berhasil.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("User register failed:", error.message);
    return res.status(500).json({ message: "Gagal mendaftar." });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Akun sedang disuspend." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({
      message: "Login berhasil.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("User login failed:", error.message);
    return res.status(500).json({ message: "Gagal login." });
  }
});

app.get("/api/admin/members", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json({ users: users.map(formatUser) });
  } catch (error) {
    console.error("Failed to load users:", error.message);
    return res.status(500).json({ message: "Gagal memuat user." });
  }
});

app.patch("/api/admin/members/:id", async (req, res) => {
  try {
    const updates = {};
    for (const field of ["username", "name", "phone", "email"]) {
      if (typeof req.body[field] === "string") {
        updates[field] = req.body[field].trim();
      }
    }
    if (updates.username) updates.username = updates.username.toLowerCase();
    if (updates.email) updates.email = updates.email.toLowerCase();

    const duplicate = await User.findOne({
      _id: { $ne: req.params.id },
      $or: [
        updates.username ? { username: updates.username } : null,
        updates.phone ? { phone: updates.phone } : null,
        updates.email ? { email: updates.email } : null,
      ].filter(Boolean),
    });

    if (duplicate) {
      return res.status(409).json({ message: "Username, no hp, atau email sudah digunakan." });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    return res.json({ message: "Data user berhasil diubah.", user: formatUser(user) });
  } catch (error) {
    console.error("Failed to update user:", error.message);
    return res.status(500).json({ message: "Gagal mengubah user." });
  }
});

app.patch("/api/admin/members/:id/password", async (req, res) => {
  try {
    const password = String(req.body.password || "");
    if (password.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.params.id, { passwordHash }, { new: true });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    return res.json({ message: "Password user berhasil diubah.", user: formatUser(user) });
  } catch (error) {
    console.error("Failed to update user password:", error.message);
    return res.status(500).json({ message: "Gagal mengubah password user." });
  }
});

app.patch("/api/admin/members/:id/status", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: Boolean(req.body.isSuspended) },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    return res.json({
      message: user.isSuspended ? "User berhasil disuspend." : "Suspend user dibuka.",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Failed to update user status:", error.message);
    return res.status(500).json({ message: "Gagal mengubah status user." });
  }
});

app.delete("/api/admin/games/:id", async (req, res) => {
  try {
    const game = await Product.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: "Game tidak ditemukan." });

    return res.json({ message: "Game berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete game:", error.message);
    return res.status(500).json({ message: "Gagal menghapus game." });
  }
});

function formatAdmin(admin) {
  return {
    id: admin._id,
    username: admin.username,
    role: admin.role,
    isSuspended: admin.isSuspended,
    lastLoginAt: admin.lastLoginAt,
    createdAt: admin.createdAt,
  };
}

app.get("/api/admin/users", async (req, res) => {
  try {
    const admins = await AdminUser.find().sort({ createdAt: -1 });

    return res.json({
      admins: admins.map(formatAdmin),
    });
  } catch (error) {
    console.error("Failed to load admins:", error.message);

    return res.status(500).json({
      message: "Gagal memuat data admin.",
    });
  }
});

app.post("/api/admin/users", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "admin").trim().toLowerCase();

    if (!username || !password) {
      return res.status(400).json({
        message: "Username dan password wajib diisi.",
      });
    }

    const existingAdmin = await AdminUser.findOne({ username });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Username admin sudah digunakan.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await AdminUser.create({
      username,
      passwordHash,
      role,
    });

    return res.status(201).json({
      message: "Admin berhasil ditambahkan.",
      admin: formatAdmin(admin),
    });
  } catch (error) {
    console.error("Failed to create admin:", error.message);

    return res.status(500).json({
      message: "Gagal menambahkan admin.",
    });
  }
});

app.patch("/api/admin/users/:id/password", async (req, res) => {
  try {
    const password = String(req.body.password || "");

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { passwordHash },
      { new: true },
    );

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan.",
      });
    }

    return res.json({
      message: "Password admin berhasil diubah.",
      admin: formatAdmin(admin),
    });
  } catch (error) {
    console.error("Failed to update admin password:", error.message);

    return res.status(500).json({
      message: "Gagal mengubah password admin.",
    });
  }
});

app.patch("/api/admin/users/:id/status", async (req, res) => {
  try {
    const admin = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { isSuspended: Boolean(req.body.isSuspended) },
      { new: true },
    );

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan.",
      });
    }

    return res.json({
      message: admin.isSuspended ? "Admin berhasil disuspend." : "Suspend admin dibuka.",
      admin: formatAdmin(admin),
    });
  } catch (error) {
    console.error("Failed to update admin status:", error.message);

    return res.status(500).json({
      message: "Gagal mengubah status admin.",
    });
  }
});

app.patch("/api/admin/users/:id/role", async (req, res) => {
  try {
    const role = String(req.body.role || "admin").trim().toLowerCase();
    const admin = await AdminUser.findByIdAndUpdate(req.params.id, { role }, { new: true });

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan.",
      });
    }

    return res.json({
      message: "Role admin berhasil diubah.",
      admin: formatAdmin(admin),
    });
  } catch (error) {
    console.error("Failed to update admin role:", error.message);

    return res.status(500).json({
      message: "Gagal mengubah role admin.",
    });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const admin = await AdminUser.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin tidak ditemukan.",
      });
    }

    return res.json({
      message: "Admin berhasil dihapus.",
    });
  } catch (error) {
    console.error("Failed to delete admin:", error.message);

    return res.status(500).json({
      message: "Gagal menghapus admin.",
    });
  }
});

async function startServer() {
  try {
    await connectDatabase();

    httpServer.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log("MongoDB connected");
      console.log("Socket.IO ready");
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
