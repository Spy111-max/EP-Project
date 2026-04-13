"use strict";

/**
 * GET /api/greenspaces
 *
 * Query params:
 *   lat     (number)  Centre latitude
 *   lng     (number)  Centre longitude
 *   radius  (number)  Radius in metres (default 5000)
 *
 * Returns: { geojson: GeoJSON FeatureCollection, cached: bool }
 */

const express = require("express");
const { getGreenspaces } = require("../services/osmGreenspace");

const router = express.Router();

router.get("/", async (req, res) => {
  const lat    = parseFloat(req.query.lat);
  const lng    = parseFloat(req.query.lng);
  const radius = parseInt(req.query.radius, 10) || 5000;

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng are required numeric parameters." });
  }

  try {
    const { geojson, cached } = await getGreenspaces(lat, lng, radius);
    return res.json({ geojson, cached });
  } catch (err) {
    console.error("[greenspaces]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
