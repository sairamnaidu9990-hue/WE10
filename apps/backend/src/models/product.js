const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },
    minPlayers: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
    },
    maxPlayers: {
      type: Number,
      default: 10,
      min: 1,
      max: 10,
    },
    lobbyName: {
      type: String,
      default: "Konami Cup National",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Product", productSchema);
