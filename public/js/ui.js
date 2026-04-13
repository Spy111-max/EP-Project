/**
 * ui.js
 * ──────
 * Manages DOM updates: stats panel, zones list, toast notifications, spinner.
 */

"use strict";

const UI = (() => {
  const $ = (id) => document.getElementById(id);

  // ── Toast ───────────────────────────────────────────────────────────────────

  let _toastTimer = null;

  function toast(msg, type = "info", durationMs = 3000) {
    const el = $("toast");
    el.textContent = msg;
    el.className = `show${type === "error" ? " error" : ""}`;
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { el.className = ""; }, durationMs);
  }

  // ── Spinner ─────────────────────────────────────────────────────────────────

  function showSpinner(visible) {
    $("spinner").hidden = !visible;
  }

  // ── Stats panel ─────────────────────────────────────────────────────────────

  function renderStats(data) {
    const panel = $("stats-panel");
    const content = $("stats-content");
    const pct = Math.round(data.confidence * 100);

    content.innerHTML = `
      <div class="confidence-bar">
        <div class="bar-label">
          <span>Overall suitability confidence</span>
          <span>${pct}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.suitableAreaHa}</div>
        <div class="stat-label">Suitable area (ha)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.totalZones}</div>
        <div class="stat-label">Candidate zones</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(data.totalTreesCapacity || 0).toLocaleString()}</div>
        <div class="stat-label">Trees capacity</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.cached ? "⚡" : "🛰️"}</div>
        <div class="stat-label">${data.cached ? "Cached result" : "Live data"}</div>
      </div>
    `;

    panel.hidden = false;
  }

  // ── Zones list ──────────────────────────────────────────────────────────────

  function renderZones(zones, onZoneClick) {
    const panel = $("zones-panel");
    const list  = $("zones-list");
    list.innerHTML = "";

    if (!zones || !zones.length) {
      panel.hidden = true;
      return;
    }

    zones.slice(0, 15).forEach((zone, i) => {
      const pct = Math.round(zone.score * 100);
      const li  = document.createElement("li");
      li.className = "zone-item";
      li.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="zone-type">${zone.type.replace(/_/g, " ")}</span>
          <span class="zone-score" style="color:${LandAnalysis.scoreColour(zone.score)}">${pct}%</span>
        </div>
        <div class="zone-meta">
          📍 ${zone.lat.toFixed(4)}, ${zone.lng.toFixed(4)} &nbsp;|&nbsp;
          ~${(zone.areaM2 / 10000).toFixed(2)} ha &nbsp;|&nbsp;
          🌱 ${zone.treesPerZone} trees
        </div>
      `;
      li.dataset.index = i;
      li.addEventListener("click", () => onZoneClick(zone));
      list.appendChild(li);
    });

    panel.hidden = false;
  }

  // ── Radius label ────────────────────────────────────────────────────────────

  function updateRadiusLabel(valueM) {
    const km = (valueM / 1000).toFixed(1).replace(/\.0$/, "");
    $("radius-label").textContent = `${km} km`;
  }

  return { toast, showSpinner, renderStats, renderZones, updateRadiusLabel };
})();

// eslint-disable-next-line no-unused-vars
window.UI = UI;
