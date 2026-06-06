require("dotenv").config();

const mongoose = require("mongoose");
const { connectDatabase } = require("./db");

async function checkDatabase() {
  try {
    const connection = await connectDatabase();
    console.log(`MongoDB connected: ${connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

checkDatabase();
