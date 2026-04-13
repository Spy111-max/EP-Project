"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const landAnalysisRoute = require("./src/routes/landAnalysis");
const ndviRoute = require("./src/routes/ndvi");
const landcoverRoute = require("./src/routes/landcover");
const greenspacesRoute = require("./src/routes/greenspaces");
const cache = require("./src/cache");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/land-analysis", apiLimiter, landAnalysisRoute);
app.use("/api/ndvi", apiLimiter, ndviRoute);
app.use("/api/landcover", apiLimiter, landcoverRoute);
app.use("/api/greenspaces", apiLimiter, greenspacesRoute);

// Cache management
app.get("/api/cache/stats", apiLimiter, (_req, res) => {
  res.json(cache.getStats());
});

app.delete("/api/cache/clear", apiLimiter, (_req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared successfully." });
});

// ── Serve SPA fallback ────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Urban Tree Planting Advisor running on http://localhost:${PORT}`);
});

module.exports = app;
