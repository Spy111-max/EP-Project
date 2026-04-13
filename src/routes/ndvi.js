"use strict";

/**
 * GET /api/ndvi
 *
 * Query params:
 *   bbox  (string)  Comma-separated minLng,minLat,maxLng,maxLat
 *   date  (string)  Optional YYYY-MM-DD date for imagery (default: latest)
 *
 * Returns: { image: <base64 PNG>, cached: bool }
 * Falls back to a 204 No Content when Sentinel Hub is not configured.
 */

const express = require("express");
const { getNdviImage } = require("../services/sentinelHub");

const router = express.Router();

router.get("/", async (req, res) => {
  const bboxParam = req.query.bbox;
  const date = req.query.date || null;

  if (!bboxParam) {
    return res.status(400).json({ error: "bbox query parameter is required." });
  }

  const bbox = bboxParam.split(",").map(Number);
  if (bbox.length !== 4 || bbox.some(isNaN)) {
    return res.status(400).json({ error: "bbox must be minLng,minLat,maxLng,maxLat." });
  }

  try {
    const { data, cached } = await getNdviImage(bbox, date);
    return res.json({ image: data, cached });
  } catch (err) {
    if (err.message.includes("not configured")) {
      // Graceful degradation when API key is absent
      return res.status(204).end();
    }
    console.error("[ndvi]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
