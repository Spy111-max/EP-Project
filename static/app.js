const state = {
  map: null,
  markers: [],
  heatLayer: null,
  overlayControl: null,
  landLayers: {},
  allZones: [],
  viewportZoneIds: [],
  selectedZoneId: null,
  aqiChart: null,
  carbonChart: null,
};

function pollutionColor(pm25) {
  if (pm25 > 120) return "#9f3212";
  if (pm25 > 90) return "#d7611f";
  if (pm25 > 60) return "#eb9f2b";
  if (pm25 > 30) return "#82a73c";
  return "#1f7a4f";
}

async function getJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function initMap() {
  state.map = L.map("map", {
    zoomControl: true,
    minZoom: 4,
  }).setView([22.8, 79.5], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(state.map);

  state.overlayControl = L.control.layers({}, {}, { collapsed: true }).addTo(state.map);

  state.map.on("moveend", () => {
    refreshViewportInsights().catch((error) => console.error(error));
  });
}

function formatSpeciesItem(species) {
  const aiLabel =
    species.ml_score !== null && species.ml_score !== undefined
      ? ` | AI: ${(species.ml_score * 100).toFixed(1)}%`
      : "";

  return `<li>
    <strong>${species.common_name}</strong>
    <span>${species.scientific_name}</span><br />
    <span>Match: ${(species.match_score * 100).toFixed(1)}%${aiLabel} | Growth: ${species.growth_years} yrs</span>
  </li>`;
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function clearSatelliteLayers() {
  Object.values(state.landLayers).forEach(({ layer }) => {
    if (state.map.hasLayer(layer)) {
      state.map.removeLayer(layer);
    }
    if (state.overlayControl) {
      state.overlayControl.removeLayer(layer);
    }
  });
  state.landLayers = {};
}

function syncSatelliteLayers(recommendationData) {
  const landStructure = recommendationData.land_structure;
  if (!landStructure) {
    clearSatelliteLayers();
    return;
  }

  const layers = landStructure.map_layers || [];
  clearSatelliteLayers();

  layers.forEach((config, index) => {
    const layer = L.tileLayer.wms(config.tile_url, {
      layers: config.layer,
      format: "image/png",
      transparent: true,
      version: "1.1.1",
      opacity: config.opacity,
      attribution: `${config.provider} via Terrascope`,
    });

    state.landLayers[config.id] = { config, layer };

    if (state.overlayControl) {
      state.overlayControl.addOverlay(layer, config.label);
    }

    if (config.default || index === 0) {
      layer.addTo(state.map);
    }
  });

  const status = document.getElementById("land-layer-status");
  if (status) {
    const activeLabel = layers.find((layer) => layer.default)?.label || layers[0]?.label || "Satellite overlay";
    status.textContent = activeLabel;
  }
}

function renderLandInsights(recommendationData) {
  const panel = document.getElementById("land-insights");
  if (!panel) {
    return;
  }

  const landStructure = recommendationData.land_structure;
  if (!landStructure) {
    panel.innerHTML = "";
    return;
  }

  const mix = landStructure.blended_land_cover_mix || {};
  const measures = landStructure.measures || [];
  const sources = landStructure.sources || {};
  const legend = landStructure.legend || [];

  panel.innerHTML = `
    <div class="land-head">
      <p class="land-title">Land Structure (Real Satellite Raster)</p>
      <span class="chip">${landStructure.land_classification.replaceAll("_", " ")}</span>
      <span class="chip muted">Feasibility: ${formatPercent(landStructure.land_feasibility_score)}</span>
      <span class="chip muted">Confidence: ${formatPercent(landStructure.confidence)}</span>
    </div>
    <p class="land-meta">Mode: ${landStructure.analysis_mode || "satellite_raster"} | Samples: ${landStructure.sample_count || 0}</p>
    <div class="land-mix-grid">
      <div><p>Built-up</p><strong>${formatPercent(mix.built_up)}</strong></div>
      <div><p>Agriculture</p><strong>${formatPercent(mix.agriculture)}</strong></div>
      <div><p>Green/Open</p><strong>${formatPercent(mix.green_open)}</strong></div>
      <div><p>Water</p><strong>${formatPercent(mix.water)}</strong></div>
    </div>
    <div class="land-source-grid">
      ${Object.entries(sources)
        .map(
          ([key, source]) => `
            <article class="land-source-card">
              <strong>${source.label || key}</strong>
              <span>${formatPercent(source.confidence)} confidence</span>
              <small>${source.sample_count || 0} samples</small>
            </article>
          `
        )
        .join("")}
    </div>
    <ul class="land-measures">
      ${measures.map((measure) => `<li>${measure}</li>`).join("")}
    </ul>
    <div class="land-legend">
      ${legend
        .map(
          (item) => `
            <span class="legend-item"><i style="background:${item.color}"></i>${item.label}</span>
          `
        )
        .join("")}
    </div>
  `;
}

function drawCharts(forecast) {
  const years = forecast.map((f) => f.years);
  const pm25Values = forecast.map((f) => f.projected_pm25);
  const carbonValues = forecast.map((f) => f.carbon_sequestration_tonnes);

  const aqiCtx = document.getElementById("aqiChart");
  const carbonCtx = document.getElementById("carbonChart");

  if (state.aqiChart) state.aqiChart.destroy();
  if (state.carbonChart) state.carbonChart.destroy();

  state.aqiChart = new Chart(aqiCtx, {
    type: "line",
    data: {
      labels: years,
      datasets: [
        {
          label: "Projected PM2.5",
          data: pm25Values,
          borderColor: "#f15a24",
          backgroundColor: "rgba(241,90,36,0.22)",
          pointBackgroundColor: "#f15a24",
          pointRadius: 4,
          tension: 0.35,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: "#233123" } },
      },
      scales: {
        y: { ticks: { color: "#233123" }, grid: { color: "rgba(35,49,35,0.14)" } },
        x: { ticks: { color: "#233123" }, grid: { color: "rgba(35,49,35,0.08)" } },
      },
    },
  });

  state.carbonChart = new Chart(carbonCtx, {
    type: "bar",
    data: {
      labels: years,
      datasets: [
        {
          label: "Carbon Sequestration (tonnes)",
          data: carbonValues,
          backgroundColor: ["#1f7a4f", "#3f9f64", "#6db77c"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: "#233123" } },
      },
      scales: {
        y: { ticks: { color: "#233123" }, grid: { color: "rgba(35,49,35,0.14)" } },
        x: { ticks: { color: "#233123" }, grid: { color: "rgba(35,49,35,0.08)" } },
      },
    },
  });
}

function updateImpactMetrics(impact) {
  const basePm25 = document.getElementById("base-pm25");
  const futurePm25 = document.getElementById("future-pm25");
  const futureCarbon = document.getElementById("future-carbon");

  const last = impact.forecast[impact.forecast.length - 1];
  basePm25.textContent = `${impact.base_pm25}`;
  futurePm25.textContent = `${last.projected_pm25}`;
  futureCarbon.textContent = `${last.carbon_sequestration_tonnes} t`;
}

function updateKpis(zones) {
  const pm25 = document.getElementById("kpi-pm25");
  const urgency = document.getElementById("kpi-urgency");
  const visible = document.getElementById("kpi-visible");
  const trees = document.getElementById("kpi-trees");

  if (zones.length === 0) {
    pm25.textContent = "-";
    urgency.textContent = "-";
    visible.textContent = "0";
    trees.textContent = "-";
    return;
  }

  const avgPm25 = zones.reduce((sum, z) => sum + z.pollution.pm25, 0) / zones.length;
  const avgUrgency = zones.reduce((sum, z) => sum + z.urgency_score, 0) / zones.length;
  const targetTrees = Math.round(1400 + zones.length * 320 + avgPm25 * 8);

  pm25.textContent = avgPm25.toFixed(1);
  urgency.textContent = avgUrgency.toFixed(1);
  visible.textContent = String(zones.length);
  trees.textContent = targetTrees.toLocaleString();
}

async function loadRecommendations(zoneId) {
  const [recommendationData, impactData] = await Promise.all([
    getJSON(`/api/recommendations?zone_id=${encodeURIComponent(zoneId)}`),
    getJSON(`/api/impact?zone_id=${encodeURIComponent(zoneId)}`),
  ]);

  const fastList = document.getElementById("fast-list");
  const longList = document.getElementById("long-list");
  const activeZone = document.getElementById("active-zone");
  const mode = document.getElementById("map-mode");

  activeZone.textContent = recommendationData.zone.name;
  mode.textContent = "Zone Focus Mode";
  renderLandInsights(recommendationData);
  syncSatelliteLayers(recommendationData);
  fastList.innerHTML = recommendationData.fast_growing.map(formatSpeciesItem).join("");
  longList.innerHTML = recommendationData.long_term.map(formatSpeciesItem).join("");

  drawCharts(impactData.impact.forecast);
  updateImpactMetrics(impactData.impact);
}

async function loadViewportRecommendations(zoneIds) {
  const zoneQuery = encodeURIComponent(zoneIds.join(","));
  const [recommendationData, impactData] = await Promise.all([
    getJSON(`/api/recommendations/viewport?zone_ids=${zoneQuery}`),
    getJSON(`/api/impact/viewport?zone_ids=${zoneQuery}`),
  ]);

  const fastList = document.getElementById("fast-list");
  const longList = document.getElementById("long-list");
  const activeZone = document.getElementById("active-zone");
  const mode = document.getElementById("map-mode");

  mode.textContent = "Viewport AI Mode";
  activeZone.textContent = `Viewport (${recommendationData.zone_count} zones)`;
  renderLandInsights(recommendationData);
  syncSatelliteLayers(recommendationData);
  fastList.innerHTML = recommendationData.fast_growing.map(formatSpeciesItem).join("");
  longList.innerHTML = recommendationData.long_term.map(formatSpeciesItem).join("");

  drawCharts(impactData.impact.forecast);
  updateImpactMetrics(impactData.impact);
}

function updateHeatLayer(zones) {
  if (!L.heatLayer) {
    return;
  }

  if (state.heatLayer) {
    state.map.removeLayer(state.heatLayer);
  }

  const points = zones.map((zone) => {
    const intensity = Math.min(zone.pollution.pm25 / 160, 1);
    return [zone.lat, zone.lon, intensity];
  });

  state.heatLayer = L.heatLayer(points, {
    radius: 26,
    blur: 24,
    minOpacity: 0.35,
    gradient: { 0.2: "#64b96f", 0.5: "#f0ae3d", 0.8: "#de5a27", 1: "#9f3212" },
  }).addTo(state.map);
}

function addMarkers(zones) {
  state.markers.forEach((m) => m.remove());
  state.markers = [];

  zones.forEach((zone) => {
    const marker = L.circleMarker([zone.lat, zone.lon], {
      radius: 10,
      color: pollutionColor(zone.pollution.pm25),
      fillColor: pollutionColor(zone.pollution.pm25),
      fillOpacity: 0.8,
      weight: 1,
    }).addTo(state.map);

    marker.bindPopup(`
      <b>${zone.name}</b><br/>
      ${zone.city}, ${zone.country}<br/>
      PM2.5: ${zone.pollution.pm25}<br/>
      Band: ${zone.pollution_band}<br/>
      Urgency: ${zone.urgency_score}
    `);

    marker.on("click", () => {
      state.selectedZoneId = zone.id;
      loadRecommendations(zone.id).catch((error) => {
        console.error(error);
      });
    });

    state.markers.push(marker);
  });

  if (zones.length > 0) {
    const bounds = L.latLngBounds(zones.map((z) => [z.lat, z.lon]));
    state.map.fitBounds(bounds.pad(0.35));
  }
}

function getZonesInViewport() {
  const bounds = state.map.getBounds();
  return state.allZones.filter((zone) => bounds.contains([zone.lat, zone.lon]));
}

async function refreshViewportInsights() {
  const visibleZones = getZonesInViewport();
  updateKpis(visibleZones);

  if (visibleZones.length === 0) {
    return;
  }

  const ids = visibleZones.map((z) => z.id);
  const sameAsCurrent =
    ids.length === state.viewportZoneIds.length && ids.every((id, index) => id === state.viewportZoneIds[index]);

  if (sameAsCurrent) {
    return;
  }

  state.viewportZoneIds = ids;
  state.selectedZoneId = null;
  await loadViewportRecommendations(ids);
}

async function loadHotspots(search = "") {
  const counter = document.getElementById("zone-counter");
  const query = search ? `?city=${encodeURIComponent(search)}` : "";
  const data = await getJSON(`/api/hotspots${query}`);
  state.allZones = data.results;

  counter.textContent = `${data.count} zones`;
  addMarkers(data.results);
  updateHeatLayer(data.results);

  if (!state.selectedZoneId && data.results.length > 0) {
    await refreshViewportInsights();
  }
}

function bindSearch() {
  const button = document.getElementById("search-btn");
  const input = document.getElementById("search-input");

  const trigger = async () => {
    state.selectedZoneId = null;
    state.viewportZoneIds = [];
    await loadHotspots(input.value.trim());
  };

  button.addEventListener("click", () => {
    trigger().catch((error) => console.error(error));
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      trigger().catch((error) => console.error(error));
    }
  });
}

// ============= NEW FEATURES =============

// Feature Tab Switching
function initFeatureTabs() {
  const tabs = document.querySelectorAll(".feature-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab visually
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Hide all content
      document.querySelectorAll(".feature-content").forEach((c) => c.classList.remove("active"));
      
      // Show selected content
      const content = document.getElementById(`${tabName}-tab`);
      if (content) {
        content.classList.add("active");
        
        // Load data for the selected feature
        const zoneId = state.selectedZoneId || (state.viewportZoneIds && state.viewportZoneIds[0]);
        if (zoneId) {
          try {
            switch (tabName) {
              case "synergy":
                await loadSynergyData(zoneId);
                break;
              case "timeline":
                await loadTimelineData(zoneId);
                break;
              case "pollutant":
                await loadPollutantData(zoneId);
                break;
              case "microclimate":
                await loadMicroclimateData(zoneId);
                break;
              case "maintenance":
                await loadMaintenanceData(zoneId);
                break;
              case "radius":
                await loadRadiusData(zoneId);
                break;
            }
          } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
          }
        }
      }
    });
  });
}

// 1. Species Synergy
async function loadSynergyData(zoneId) {
  try {
    const data = await getJSON(`/api/features/synergy/zone/${encodeURIComponent(zoneId)}`);
    const syneryList = document.getElementById("synergy-list");
    
    syneryList.innerHTML = data.recommended_combos
      .map(
        (combo) => `
          <li class="combo-item">
            <div>${combo.species.join(" + ")}</div>
            <div class="score">Synergy: ${(combo.synergy_score * 100).toFixed(1)}%</div>
          </li>
        `
      )
      .join("");
  } catch (error) {
    console.error("Synergy error:", error);
    document.getElementById("synergy-list").innerHTML = "<li>Error loading data</li>";
  }
}

// 3. Timeline
async function loadTimelineData(zoneId) {
  try {
    const data = await getJSON(`/api/features/timeline/${encodeURIComponent(zoneId)}`);
    
    const timeline = data.zone_impact_10_year;
    const years = timeline.map((t) => `Year ${t.year}`);
    const pm25Data = timeline.map((t) => t.pm25_reduction_kg);
    const carbonData = timeline.map((t) => t.carbon_sequestration_kg);
    
    const ctx = document.getElementById("timelineChart");
    if (window.timelineChart) window.timelineChart.destroy();
    
    window.timelineChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: years,
        datasets: [
          {
            label: "PM2.5 Reduction (kg)",
            data: pm25Data,
            backgroundColor: "#f15a24",
            yAxisID: "y",
          },
          {
            label: "Carbon Sequestration (kg)",
            data: carbonData,
            backgroundColor: "#1f7a4f",
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: "linear",
            position: "left",
            ticks: { color: "#233123" },
            grid: { color: "rgba(35,49,35,0.14)" },
          },
          y1: {
            type: "linear",
            position: "right",
            ticks: { color: "#1f7a4f" },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
    
    const stats = document.getElementById("timeline-stats");
    stats.innerHTML = `
      <div><p>Final PM2.5 Reduction</p><strong>${data.final_pm25_reduction} kg</strong></div>
      <div><p>Total Carbon Captured</p><strong>${data.total_carbon_captured} kg</strong></div>
    `;
  } catch (error) {
    console.error("Timeline error:", error);
  }
}

// 4. Pollutant-Specific
async function loadPollutantData(zoneId) {
  try {
    const data = await getJSON(`/api/features/pollutant/${encodeURIComponent(zoneId)}`);
    
    const profile = document.getElementById("pollutant-profile");
    let html = `<p><strong>Primary Issue:</strong> ${data.primary_issue}</p>`;
    
    for (const [pollutant, recData] of Object.entries(data.recommendations_by_pollutant)) {
      html += `
        <div style="margin-top: 10px; padding: 8px; border-left: 3px solid #f15a24;">
          <strong>${pollutant.toUpperCase()}</strong> (${recData.severity_percentage}%)<br/>
          <small>${recData.top_species.map((s) => s.species).join(", ")}</small>
        </div>
      `;
    }
    
    profile.innerHTML = html;
  } catch (error) {
    console.error("Pollutant error:", error);
  }
}

// 6. Microclimate Mapper
async function loadMicroclimateData(zoneId) {
  try {
    const data = await getJSON(`/api/features/microclimate/${encodeURIComponent(zoneId)}`);
    
    const grid = document.getElementById("microclimate-grid");
    grid.innerHTML = data.blocks
      .map(
        (block) => `
          <div style="padding: 12px; border-radius: 8px; background-color: 
                      ${block.pollution_level === 'HIGH' ? '#f15a24' : block.pollution_level === 'MODERATE' ? '#f0ae3d' : '#64b96f'};
                      color: white; text-align: center;">
            <div style="font-size: 12px; font-weight: bold;">Block ${block.grid_position.row}-${block.grid_position.col}</div>
            <div style="font-size: 14px; font-weight: bold;">${block.pm25} PM2.5</div>
            <div style="font-size: 10px;">${block.pollution_level}</div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Microclimate error:", error);
  }
}

// 7. Maintenance Alerts
async function loadMaintenanceData(zoneId) {
  try {
    // Assuming first fast-growing species
    const speciesName = "Neem"; // Default
    const data = await getJSON(`/api/features/maintenance/predict/${encodeURIComponent(speciesName)}/${encodeURIComponent(zoneId)}`);
    
    const calendar = document.getElementById("maintenance-calendar");
    calendar.innerHTML = data.maintenance_alerts
      .map(
        (alert) => `
          <li style="padding: 10px; margin: 8px 0; border-left: 3px solid 
                     ${alert.severity === 'CRITICAL' ? '#9f3212' : alert.severity === 'MEDIUM' ? '#f0ae3d' : '#64b96f'};">
            <strong>${alert.alert_type}</strong> [${alert.severity}]<br/>
            <small>${alert.description}</small><br/>
            <div style="margin-top: 5px; font-size: 11px; color: #666;">Action: ${alert.action}</div>
          </li>
        `
      )
      .join("");
  } catch (error) {
    console.error("Maintenance error:", error);
  }
}

// 8. Impact Radius
async function loadRadiusData(zoneId) {
  try {
    const data = await getJSON(`/api/features/impact/radius/${encodeURIComponent(zoneId)}`);
    
    const projection = data.impact_projection_10_year;
    const years = projection.map((p) => `Year ${p.year}`);
    const coverageData = projection.map((p) => p.zone_coverage_percent);
    
    const ctx = document.getElementById("radiusChart");
    if (window.radiusChart) window.radiusChart.destroy();
    
    window.radiusChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Zone Coverage %",
            data: coverageData,
            borderColor: "#1f7a4f",
            backgroundColor: "rgba(31, 122, 79, 0.2)",
            pointBackgroundColor: "#1f7a4f",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#233123" },
            grid: { color: "rgba(35,49,35,0.14)" },
          },
          x: {
            ticks: { color: "#233123" },
            grid: { color: "rgba(35,49,35,0.08)" },
          },
        },
      },
    });
    
    const stats = document.getElementById("radius-stats");
    const summary = data.summary;
    stats.innerHTML = `
      <div><p>Max Impact Radius</p><strong>${summary.max_impact_radius_m} m</strong></div>
      <div><p>Baseline PM2.5</p><strong>${summary.baseline_pm25}</strong></div>
      <div><p>Year 10 PM2.5</p><strong>${summary.projected_pm25_year10}</strong></div>
    `;
  } catch (error) {
    console.error("Radius error:", error);
  }
}

async function bootstrap() {
  initMap();
  bindSearch();
  initFeatureTabs();
  try {
    await loadHotspots();
    const mode = document.getElementById("map-mode");
    mode.textContent = "Viewport AI Mode";
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
