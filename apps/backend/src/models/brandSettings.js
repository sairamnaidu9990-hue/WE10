const mongoose = require("mongoose");

const brandSettingsSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: "WEB10",
      trim: true,
    },
    frontendTitle: {
      type: String,
      default: "Platform WEB10 siap dikembangkan.",
      trim: true,
    },
    frontendDescription: {
      type: String,
      default:
        "Header frontend ini membaca pengaturan brand dari backend sehingga nama, logo, domain, favicon, dan warna bisa diubah dari admin.",
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
    footerEnabled: {
      type: Boolean,
      default: true,
    },
    footerTitle: {
      type: String,
      default: "WEB10",
      trim: true,
    },
    footerDescription: {
      type: String,
      default: "Platform WEB10 siap melayani kebutuhan digital kamu.",
      trim: true,
    },
    footerCopyright: {
      type: String,
      default: "© 2026 WEB10. All rights reserved.",
      trim: true,
    },
    footerBackgroundColor: {
      type: String,
      default: "#101115",
      trim: true,
    },
    footerTextColor: {
      type: String,
      default: "#ffffff",
      trim: true,
    },
    footerLinkOneLabel: {
      type: String,
      default: "Home",
      trim: true,
    },
    footerLinkOneUrl: {
      type: String,
      default: "/",
      trim: true,
    },
    footerLinkTwoLabel: {
      type: String,
      default: "Artikel",
      trim: true,
    },
    footerLinkTwoUrl: {
      type: String,
      default: "#",
      trim: true,
    },
    footerLinkThreeLabel: {
      type: String,
      default: "Cek Transaksi",
      trim: true,
    },
    footerLinkThreeUrl: {
      type: String,
      default: "#",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BrandSettings", brandSettingsSchema);
