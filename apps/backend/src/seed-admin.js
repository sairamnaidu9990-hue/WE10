require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectDatabase } = require("./db");
const AdminUser = require("./models/adminUser");

async function seedAdmin() {
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is missing. Add it to your .env file.");
  }

  await connectDatabase();

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.findOneAndUpdate(
    { username },
    {
      username,
      passwordHash,
      role: "admin",
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log(`Admin login saved in MongoDB for username: ${username}`);
}

seedAdmin()
  .catch((error) => {
    console.error(`Failed to seed admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
