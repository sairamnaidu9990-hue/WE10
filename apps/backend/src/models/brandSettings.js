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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BrandSettings", brandSettingsSchema);
