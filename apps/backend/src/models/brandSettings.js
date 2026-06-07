const mongoose = require("mongoose");

const brandSettingsSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: "WEB10",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    faviconUrl: {
      type: String,
      default: "",
      trim: true,
    },
    domain: {
      type: String,
      default: "",
      trim: true,
    },
    headerBackgroundColor: {
      type: String,
      default: "#101115",
      trim: true,
    },
    headerTextColor: {
      type: String,
      default: "#ffffff",
      trim: true,
    },
    headerAccentColor: {
      type: String,
      default: "#38bdf8",
      trim: true,
    },
    frontendBackgroundColor: {
      type: String,
      default: "#f4f7fb",
      trim: true,
    },
    bannerEnabled: {
      type: Boolean,
      default: true,
    },
    bannerImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    bannerTitle: {
      type: String,
      default: "Selamat datang di WEB10",
      trim: true,
    },
    bannerSubtitle: {
      type: String,
      default: "Banner utama bisa diubah dari admin dashboard.",
      trim: true,
    },
    bannerLink: {
      type: String,
      default: "",
      trim: true,
    },
    bannerBackgroundColor: {
      type: String,
      default: "#17202a",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BrandSettings", brandSettingsSchema);
