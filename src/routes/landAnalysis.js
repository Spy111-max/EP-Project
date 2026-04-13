"use strict";

/**
 * GET /api/land-analysis
 *
 * Query params:
 *   lat     (number)  Centre latitude
 *   lng     (number)  Centre longitude
 *   radius  (number)  Search radius in metres (default 5000)
 *   tree    (string)  Tree species: neem | banyan | mango | any (default any)
 *
 * Returns a JSON object with:
 *   bbox, tree, confidence, suitableAreaHa, zones[], cached
 */

const express = require("express");
const cache = require("../cache");
const { getGreenspaces } = require("../services/osmGreenspace");
const { getLandCoverStats } = require("../services/esriLandcover");

const router = express.Router();

// ── Species requirements ──────────────────────────────────────────────────────

const SPECIES_CONFIG = {
  neem: {
    minSpaceM2: 25,          // minimum plot area per tree
    preferredLandTypes: ["grass_shrub", "bare_ground", "crops", "rangeland"],
    suitableLandTypes: ["trees", "grass_shrub", "bare_ground", "flooded_vegetation", "crops", "rangeland"],
    droughtTolerant: true,
    spacingMultiplier: 1.0,
  },
  banyan: {
    minSpaceM2: 100,
    preferredLandTypes: ["grass_shrub", "crops", "rangeland"],
    suitableLandTypes: ["trees", "grass_shrub", "crops", "rangeland"],
    droughtTolerant: false,
    spacingMultiplier: 2.5,  // needs more space due to aerial roots
  },
  mango: {
    minSpaceM2: 64,
    preferredLandTypes: ["crops", "grass_shrub", "rangeland"],
    suitableLandTypes: ["crops", "grass_shrub", "rangeland", "bare_ground"],
    droughtTolerant: false,
    spacingMultiplier: 1.8,
  },
  any: {
    minSpaceM2: 20,
    preferredLandTypes: ["grass_shrub", "crops", "bare_ground", "rangeland"],
    suitableLandTypes: ["trees", "grass_shrub", "crops", "bare_ground", "rangeland", "flooded_vegetation"],
    droughtTolerant: true,
    spacingMultiplier: 1.0,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert radius (m) to approximate degree delta. */
function radiusToBboxDelta(radiusM) {
  const latDeg = radiusM / 111320;
  const lngDeg = radiusM / 111320; // simplified (good enough for city scale)
  return { latDeg, lngDeg };
}

/** Compute suitability score for land cover stats vs species config. */
function computeSuitabilityScore(lcStats, speciesConfig) {
  const totalPixels = Object.values(lcStats).reduce((s, v) => s + v, 0);
  if (totalPixels === 0) return 0;

  const unsuitable = (lcStats.built_area || 0) + (lcStats.water || 0) + (lcStats.snow_ice || 0);
  const preferred = speciesConfig.preferredLandTypes.reduce((s, k) => s + (lcStats[k] || 0), 0);
  const suitable = speciesConfig.suitableLandTypes.reduce((s, k) => s + (lcStats[k] || 0), 0);

  const unsuitableRatio = unsuitable / totalPixels;
  const preferredRatio  = preferred  / totalPixels;
  const suitableRatio   = suitable   / totalPixels;

  // Weighted score: penalise built-up, reward preferred/suitable
  const score = Math.max(
    0,
    suitableRatio * 0.5 + preferredRatio * 0.3 - unsuitableRatio * 0.8
  );
  return Math.min(1, score);
}

/** Derive candidate zones from OSM greenspace features. */
function extractZones(geojsonFeatures, speciesConfig) {
  return geojsonFeatures
    .map((f) => {
      const tags = f.properties.tags || {};
      const type = tags.leisure || tags.landuse || tags.natural || "unknown";
      const coords = f.geometry.coordinates[0];

      // Centroid (simple average)
      const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
      const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;

      // Rough area (degrees² → m²)
      const lngSpan = Math.abs(coords.reduce((mx, c) => Math.max(mx, c[0]), -Infinity) -
                                coords.reduce((mn, c) => Math.min(mn, c[0]), Infinity));
      const latSpan = Math.abs(coords.reduce((mx, c) => Math.max(mx, c[1]), -Infinity) -
                                coords.reduce((mn, c) => Math.min(mn, c[1]), Infinity));
      const areaM2 = lngSpan * 111320 * latSpan * 111320;

      // Trees that fit
      const treesPerZone = Math.floor(areaM2 / (speciesConfig.minSpaceM2 * speciesConfig.spacingMultiplier));

      // Local suitability heuristic based on tag type
      const tagScore = {
        park: 0.85, garden: 0.80, grass: 0.75, meadow: 0.80,
        forest: 0.70, wood: 0.65, grassland: 0.75, grave_yard: 0.55,
        cemetery: 0.55, allotments: 0.70,
      };
      const score = tagScore[type] || 0.60;

      return { lat, lng, score, type, areaM2: Math.round(areaM2), treesPerZone };
    })
    .filter((z) => z.treesPerZone >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

// ── Route handler ─────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  const lat    = parseFloat(req.query.lat);
  const lng    = parseFloat(req.query.lng);
  const radius = parseInt(req.query.radius, 10) || 5000;
  const tree   = (req.query.tree || "any").toLowerCase();

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng are required numeric parameters." });
  }

  const speciesConfig = SPECIES_CONFIG[tree] || SPECIES_CONFIG.any;

  const cacheKey = `analysis:${lat},${lng},${radius},${tree}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const { latDeg, lngDeg } = radiusToBboxDelta(radius);
    const bbox = [lng - lngDeg, lat - latDeg, lng + lngDeg, lat + latDeg];

    // Fetch data in parallel
    const [greenspaceResult, landCoverResult] = await Promise.allSettled([
      getGreenspaces(lat, lng, radius),
      getLandCoverStats(bbox),
    ]);

    const greenspaces = greenspaceResult.status === "fulfilled" ? greenspaceResult.value.geojson : { features: [] };
    const lcStats     = landCoverResult.status    === "fulfilled" ? landCoverResult.value.stats    : {};

    const confidence    = computeSuitabilityScore(lcStats, speciesConfig);
    const zones         = extractZones(greenspaces.features || [], speciesConfig);
    const suitableAreaHa = zones.reduce((s, z) => s + z.areaM2, 0) / 10000;

    const result = {
      bbox,
      tree,
      confidence: parseFloat(confidence.toFixed(3)),
      suitableAreaHa: parseFloat(suitableAreaHa.toFixed(2)),
      totalZones: zones.length,
      totalTreesCapacity: zones.reduce((s, z) => s + z.treesPerZone, 0),
      landCoverBreakdown: lcStats,
      zones,
    };

    cache.set(cacheKey, result);
    return res.json({ ...result, cached: false });
  } catch (err) {
    console.error("[land-analysis]", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
