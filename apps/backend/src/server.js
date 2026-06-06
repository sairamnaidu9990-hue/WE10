require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { connectDatabase } = require("./db");

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

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return res.status(500).json({
      message: "Admin credentials are not configured on the server.",
    });
  }

  if (username === adminUsername && password === adminPassword) {
    return res.json({
      message: "Login successful",
      admin: {
        username: adminUsername,
      },
    });
  }

  return res.status(401).json({
    message: "Username atau password salah.",
  });
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
