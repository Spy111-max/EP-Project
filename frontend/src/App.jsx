import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AQISummaryGrid from "./components/AQISummaryGrid";
import ChartSection from "./components/ChartSection";
import AreaOverviewReport from "./components/AreaOverviewReport";
import MapPreview from "./components/MapPreview";
import TreeRecommendationsPanel from "./components/TreeRecommendationsPanel";
import LoadingSkeleton from "./components/LoadingSkeleton";
import CitySelector from "./components/CitySelector";
import { cityCatalog, cityInsights } from "./data/mockDashboardData";
import { getTreeSlugFromName } from "./data/environment/treeDetailsData";
import { pageVariants, sectionStaggerVariants, sectionVariants } from "./animations/variants";

export default function App({ darkMode, onToggleDarkMode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState("");

  const selectedCity = cityCatalog.find((city) => city.id === selectedCityId) || null;
  const selectedInsight = selectedCityId ? cityInsights[selectedCityId] : null;
  const allHotspots = useMemo(
    () => Object.values(cityInsights).flatMap((insight) => insight.hotspots || []),
    [],
  );
  const baselineRecommendations = useMemo(() => {
    const bestByName = new Map();

    Object.values(cityInsights).forEach((insight) => {
      (insight.recommendations || []).forEach((item) => {
        const key = item.commonName || item.id;
        const current = bestByName.get(key);
        if (!current || item.match > current.match) {
          bestByName.set(key, item);
        }
      });
    });

    return Array.from(bestByName.values())
      .sort((left, right) => right.match - left.match)
      .slice(0, 4)
      .map((item, index) => ({
        ...item,
        id: `baseline-${item.id || index}`,
      }));
  }, []);

  const visibleRecommendations =
    selectedInsight?.recommendations?.length ? selectedInsight.recommendations : baselineRecommendations;

  function openTreeDetails(item) {
    const treeSlug = getTreeSlugFromName(item?.commonName);
    navigate(`/trees/${treeSlug}`, {
      state: {
        recommendation: item,
        cityName: selectedCity?.name || null,
      },
    });
  }

  function openExecutiveDetails(cardId) {
    const routeByCard = {
      "national-aqi": "/aqi",
      "forest-coverage": "/forest-coverage",
      plantations: "/tree-plantations",
      "policy-status": "/policy-status",
      pm25: "/pollutants/pm25",
      pm10: "/pollutants/pm10",
      pm1: "/pollutants/pm1",
    };

    const route = routeByCard[cardId];
    if (route) navigate(route);
  }

  const executiveSummary = useMemo(() => {
    const insights = Object.values(cityInsights);
    const aqiValues = insights
      .map((item) => {
        const latestPoint = item.trendData?.[item.trendData.length - 1];
        return latestPoint?.aqi;
      })
      .filter((value) => typeof value === "number");
    const nationalAqi = aqiValues.length ? Math.round(aqiValues.reduce((sum, value) => sum + value, 0) / aqiValues.length) : 0;

    const totalPlantationCandidates = insights.reduce((sum, item) => sum + item.recommendations.length, 0);

    return [
      {
        id: "national-aqi",
        label: "AQI Index",
        value: nationalAqi,
        suffix: "Average",
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
        suffix: "Program",
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
      className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950"
    >
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCatalog.length} />

      <div className="mx-auto mt-3 grid max-w-[1440px] gap-3 px-4 md:px-6">
        <motion.main variants={sectionStaggerVariants} initial="hidden" animate="visible" className="space-y-4">
          <motion.section variants={sectionVariants} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {executiveSummary.map((card) => {
              const CardTag = motion.button;

              return (
              <CardTag
                key={card.id}
                type="button"
                onClick={() => openExecutiveDetails(card.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.995 }}
                className="border border-slate-300 bg-white px-4 py-3 text-left shadow-sm transition dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">{card.label}</p>
                <p className={`mt-2 text-2xl font-extrabold tracking-tight ${card.id === "plantations" ? "font-mono" : ""} ${card.tone}`}>{card.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.suffix}</p>
              </CardTag>
              );
            })}
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
                selectedHotspots={selectedInsight?.hotspots || []}
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
            <AQISummaryGrid
              cards={selectedInsight?.summaryCards || []}
              loading={loading && !!selectedCityId}
              onCardClick={openExecutiveDetails}
            />
          </motion.section>

          <AnimatePresence mode="wait">
            {loading && selectedCityId ? (
              <motion.div key="recommendation-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton className="h-[360px] w-full" />
              </motion.div>
            ) : (
              <motion.div key="recommendation-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TreeRecommendationsPanel
                  recommendations={visibleRecommendations}
                  isPersonalized={Boolean(selectedCityId)}
                  selectedCityName={selectedCity?.name}
                  onOpenTreeDetails={openTreeDetails}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCity && selectedInsight && (
            <motion.section variants={sectionVariants} className="space-y-4">
              <AreaOverviewReport city={selectedCity} insight={selectedInsight} recommendations={visibleRecommendations} />
            </motion.section>
          )}
        </motion.main>
      </div>
    </motion.div>
  );
}
