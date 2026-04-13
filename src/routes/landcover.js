"use strict";

/**
 * GET /api/landcover
 *
 * Query params:
 *   bbox  (string)  Comma-separated minLng,minLat,maxLng,maxLat
 *
 * Returns: { stats: { <class>: <pixelCount> }, cached: bool }
 */

const express = require("express");
const { getLandCoverStats } = require("../services/esriLandcover");

const router = express.Router();

router.get("/", async (req, res) => {
  const bboxParam = req.query.bbox;

  if (!bboxParam) {
    return res.status(400).json({ error: "bbox query parameter is required." });
  }

  const bbox = bboxParam.split(",").map(Number);
  if (bbox.length !== 4 || bbox.some(isNaN)) {
    return res.status(400).json({ error: "bbox must be minLng,minLat,maxLng,maxLat." });
  }

  try {
    const { stats, cached } = await getLandCoverStats(bbox);
    return res.json({ stats, cached });
  } catch (err) {
    console.error("[landcover]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
