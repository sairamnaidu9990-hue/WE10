require("dotenv").config();

const cors = require("cors");
const bcrypt = require("bcryptjs");
const express = require("express");
const { connectDatabase } = require("./db");
const AdminUser = require("./models/adminUser");
const BrandSettings = require("./models/brandSettings");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    bannerTitle: settings.bannerTitle,
    bannerSubtitle: settings.bannerSubtitle,
    bannerLink: settings.bannerLink,
    bannerBackgroundColor: settings.bannerBackgroundColor,
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
      "bannerTitle",
      "bannerSubtitle",
      "bannerLink",
      "bannerBackgroundColor",
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

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log("MongoDB connected");
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
