import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import AQISummaryGrid from "./components/AQISummaryGrid";
import ChartSection from "./components/ChartSection";
import MapPreview from "./components/MapPreview";
import TreeRecommendationsPanel from "./components/TreeRecommendationsPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";
import CitySelector from "./components/CitySelector";
import { cityCatalog, cityInsights } from "./data/mockDashboardData";
import { pageVariants, sectionStaggerVariants, sectionVariants } from "./animations/variants";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("psas-dark-mode");
    const shouldEnable = stored === "true";
    setDarkMode(shouldEnable);
    document.documentElement.classList.toggle("dark", shouldEnable);
  }, []);

  function toggleDarkMode() {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("psas-dark-mode", String(next));
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  const selectedCity = cityCatalog.find((city) => city.id === selectedCityId) || null;
  const selectedInsight = selectedCityId ? cityInsights[selectedCityId] : null;
  const allHotspots = useMemo(
    () => Object.values(cityInsights).flatMap((insight) => insight.hotspots || []),
    [],
  );

  const executiveSummary = useMemo(() => {
    const insights = Object.values(cityInsights);
    const aqiValues = insights
      .map((item) => item.summaryCards.find((card) => card.id === "aqi")?.value)
      .filter((value) => typeof value === "number");
    const nationalAqi = aqiValues.length ? Math.round(aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length) : 0;

    const totalPlantationCandidates = insights.reduce((sum, item) => sum + item.recommendations.length, 0);

    return [
      {
        id: "national-aqi",
        label: "AQI Index",
        value: nationalAqi,
        suffix: "National Average",
        tone: "text-danger-700",
      },
      {
        id: "forest-coverage",
        label: "Forest Coverage %",
        value: "24.6%",
        suffix: "YoY +0.4%",
        tone: "text-stable-700",
      },
      {
        id: "plantations",
        label: "Active Tree Plantations",
        value: `${(totalPlantationCandidates * 750).toLocaleString()}`,
        suffix: "National Program",
        tone: "text-brand-700",
      },
      {
        id: "policy-status",
        label: "Policy Status",
        value: "Active - Phase 2",
        suffix: "2026 Enforcement Cycle",
        tone: "text-warning-700",
      },
    ];
  }, []);

  useEffect(() => {
    if (!selectedCityId) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, [selectedCityId]);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-slate-100 pb-6 transition-colors duration-300 dark:bg-slate-950"
    >
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />

      <div className="mx-auto mt-3 grid max-w-[1440px] gap-3 px-4 md:px-6">
        <motion.main variants={sectionStaggerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.section variants={sectionVariants} className="border border-brand-900 bg-brand-900 px-4 py-4 text-white shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-brand-100/80">National Environmental Monitoring Dashboard</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Structured air quality and reforestation command view</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                  Search any of the 31 supported Indian cities to load city-specific AQI data, trend charts, hotspot overlays, and tree recommendations.
                </p>
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px] lg:text-right">
                <div className="border border-slate-700 bg-slate-950/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Coverage</p>
                  <p className="mt-1 font-semibold text-white">31 cities in India</p>
                </div>
                <div className="border border-slate-700 bg-slate-950/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Current View</p>
                  <p className="mt-1 font-semibold text-white">{selectedCity?.name || "National aggregate"}</p>
                </div>
                <div className="border border-slate-700 bg-slate-950/40 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Mode</p>
                  <p className="mt-1 font-semibold text-white">Live monitoring</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={sectionVariants} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {executiveSummary.map((card) => (
              <article
                key={card.id}
                className="border border-slate-300 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{card.label}</p>
                <p className={`mt-2 text-2xl font-extrabold tracking-tight ${card.tone}`}>{card.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.suffix}</p>
              </article>
            ))}
          </motion.section>

          <motion.section variants={sectionVariants} className="space-y-4">
            <CitySelector cities={cityCatalog} selectedCityId={selectedCityId} onSelectCity={setSelectedCityId} />
          </motion.section>

          <motion.section variants={sectionVariants} className="grid gap-4 xl:grid-cols-5">
            <div className="xl:col-span-3">
              <MapPreview
                cities={cityCatalog}
                selectedCity={selectedCity}
                hotspots={allHotspots}
                onSelectCity={setSelectedCityId}
              />
            </div>
            <div className="xl:col-span-2">
              <AnimatePresence mode="wait">
                {loading && selectedCityId ? (
                  <motion.div
                    key="chart-loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-4"
                  >
                    <LoadingSkeleton className="h-80 w-full" />
                    <LoadingSkeleton className="h-80 w-full" />
                  </motion.div>
                ) : (
                  <motion.div key="chart-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ChartSection trendData={selectedInsight?.trendData || []} selectedCity={selectedCity} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          <motion.section variants={sectionVariants} className="space-y-4">
            <AQISummaryGrid cards={selectedInsight?.summaryCards || []} loading={loading && !!selectedCityId} />
          </motion.section>

          <AnimatePresence mode="wait">
            {loading && selectedCityId ? (
              <motion.div key="recommendation-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton className="h-[360px] w-full" />
              </motion.div>
            ) : (
              <motion.div key="recommendation-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TreeRecommendationsPanel recommendations={selectedInsight?.recommendations || []} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </motion.div>
  );
}
