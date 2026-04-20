import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { sectionVariants } from "../animations/variants";
import { getPuneAreaAnalyzerData, puneAreaMapPoints, puneAreaOptions } from "../data/environment/puneAreaAnalyzerData";

function formatCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return "N/A";
  return `${coordinates[0].toFixed(4)}, ${coordinates[1].toFixed(4)}`;
}

export default function AreaAnalyzerPanel({ selectedCity }) {
  const [selectedAreaId, setSelectedAreaId] = useState("kothrud");
  const [baseLayer, setBaseLayer] = useState("grayscale");
  const analyzerData = useMemo(() => getPuneAreaAnalyzerData(selectedAreaId), [selectedAreaId]);

  const { locality, summary, plantableSites, excludedSites } = analyzerData;
  const mapCenter = useMemo(() => {
    const primary = plantableSites?.[0]?.coordinates;
    if (Array.isArray(primary) && primary.length === 2) return primary;
    return [18.5204, 73.8567];
  }, [plantableSites]);

  const areaOverviewDots = useMemo(
    () =>
      puneAreaMapPoints.map((area) => ({
        ...area,
        selected: area.id === selectedAreaId,
      })),
    [selectedAreaId],
  );

  const tileConfig = useMemo(() => {
    switch (baseLayer) {
      case "satellite":
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: "&copy; <a href='https://www.esri.com/'>Esri</a>",
        };
      default:
        return {
          url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          attribution:
            "&copy; <a href='https://carto.com/'>CartoDB</a> | &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a>",
        };
    }
  }, [baseLayer]);

  if (!selectedCity || selectedCity.id !== "pune") return null;

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="relative z-0 border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Area Analyzer: {locality}, Pune</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Exact on-ground planting pockets filtered for non-concrete and non-building surfaces.
            </p>
          </div>
          <label className="flex min-w-[210px] flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Select Area
            <select
              value={selectedAreaId}
              onChange={(event) => setSelectedAreaId(event.target.value)}
              className="border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium normal-case text-slate-700 outline-none focus:border-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {puneAreaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 md:grid-cols-3">
        <div>Plantable area: <span className="font-semibold">{summary.totalPlantableAreaM2} m2</span></div>
        <div>Estimated trees: <span className="font-semibold">{summary.estimatedTreeCapacity}</span></div>
        <div>Excluded hardscape: <span className="font-semibold">{summary.excludedAreaM2} m2</span></div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Planting Map (Pune)</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBaseLayer("grayscale")}
              className={`border px-3 py-1.5 text-xs font-semibold transition ${
                baseLayer === "grayscale"
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Grayscale
            </button>
            <button
              type="button"
              onClick={() => setBaseLayer("satellite")}
              className={`border px-3 py-1.5 text-xs font-semibold transition ${
                baseLayer === "satellite"
                  ? "border-brand-700 bg-brand-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              Satellite
            </button>
          </div>
          <div className="relative z-0 mt-2 h-[360px] overflow-hidden border border-slate-300 dark:border-slate-700">
            <MapContainer
              key={`${selectedAreaId}-${mapCenter[0]}-${mapCenter[1]}`}
              center={mapCenter}
              zoom={14}
              minZoom={12}
              maxZoom={18}
              scrollWheelZoom
              className="h-full w-full"
            >
              <TileLayer
                attribution={tileConfig.attribution}
                url={tileConfig.url}
              />
              {areaOverviewDots.map((area) => (
                <CircleMarker
                  key={`area-${area.id}`}
                  center={area.center}
                  radius={area.selected ? 11 : 7}
                  pathOptions={{
                    color: "#047857",
                    fillColor: "#22c55e",
                    fillOpacity: area.selected ? 0.95 : 0.8,
                    weight: area.selected ? 3 : 2,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">{area.label}</p>
                      <p>Click to compare planting pockets for this Pune area.</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {plantableSites.map((site, index) => (
                <CircleMarker
                  key={site.id}
                  center={site.coordinates}
                  radius={index === 0 ? 11 : 9}
                  pathOptions={{
                    color: "#047857",
                    fillColor: "#22c55e",
                    fillOpacity: 0.95,
                    weight: index === 0 ? 3 : 2,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs">
                      <p className="font-semibold">{site.name}</p>
                      <p>Plantable area: {site.plantableAreaM2} m2</p>
                      <p>Estimated trees: {site.estimatedTrees}</p>
                      <p>Surface: {site.surfaceType}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Green dots show all 20 Pune area points. Highlighted markers show exact candidate planting locations in {locality}. Avoid excluded hardscape and utility zones.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Exact Planting Locations</h4>
          <div className="mt-2 overflow-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <th className="px-2 py-2 font-semibold">Exact Location</th>
                  <th className="px-2 py-2 font-semibold">Coordinates</th>
                  <th className="px-2 py-2 font-semibold">Surface</th>
                  <th className="px-2 py-2 font-semibold">Plantable m2</th>
                  <th className="px-2 py-2 font-semibold">Trees</th>
                  <th className="px-2 py-2 font-semibold">Spacing</th>
                </tr>
              </thead>
              <tbody>
                {plantableSites.map((site) => (
                  <tr key={site.id} className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
                    <td className="px-2 py-2 font-semibold text-slate-800 dark:text-slate-100">{site.name}</td>
                    <td className="px-2 py-2 font-mono text-slate-600 dark:text-slate-300">{formatCoordinates(site.coordinates)}</td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{site.surfaceType}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-200">{site.plantableAreaM2}</td>
                    <td className="px-2 py-2 text-slate-700 dark:text-slate-200">{site.estimatedTrees}</td>
                    <td className="px-2 py-2 text-slate-600 dark:text-slate-300">{site.recommendedSpacingM}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Excluded (Do Not Plant)</h4>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {excludedSites.map((item) => (
              <div key={item.id} className="border border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
