require("dotenv").config();

const cors = require("cors");
const bcrypt = require("bcryptjs");
const express = require("express");
const { connectDatabase } = require("./db");
const AdminUser = require("./models/adminUser");

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

app.post("/api/admin/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.status(400).json({
        message: "Username dan password wajib diisi.",
      });
    }

    const admin = await AdminUser.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        message: "Username atau password salah.",
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
