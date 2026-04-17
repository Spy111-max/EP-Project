import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf } from "lucide-react";
import Navbar from "./Navbar";
import { getTreeDetailsBySlug } from "../data/environment/treeDetailsData";

const detailRows = [
  { key: "scientificName", label: "Scientific Name" },
  { key: "family", label: "Family" },
  { key: "nativeRange", label: "Native Range" },
  { key: "idealClimate", label: "Ideal Climate" },
  { key: "idealTemperatureRangeC", label: "Ideal Temperature Range" },
  { key: "soilType", label: "Soil Type" },
  { key: "soilPreference", label: "Soil Preference" },
  { key: "recommendedPlantingSeason", label: "Suggested Planting Season" },
  { key: "wateringSchedule", label: "Watering Frequency" },
  { key: "adaptability", label: "Adaptability" },
  { key: "reproductiveType", label: "Flowers / Fruits" },
  { key: "floweringFruitingTimeline", label: "Flowering / Fruiting Timeline" },
  { key: "maxHeight", label: "Maximum Height" },
  { key: "heightMilestones", label: "Height Growth Timeline" },
  { key: "growthRate", label: "Growth Rate" },
  { key: "averageLifespan", label: "Average Lifespan" },
  { key: "canopySpread", label: "Canopy Spread" },
  { key: "waterNeed", label: "Water Need" },
  { key: "maintenance", label: "Maintenance" },
  { key: "pollutionControl", label: "Pollution Control" },
  { key: "ecosystemBenefits", label: "Ecosystem Benefits" },
  { key: "civicUse", label: "Recommended Civic Use" },
];

export default function TreeDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const { treeSlug } = useParams();
  const location = useLocation();
  const details = getTreeDetailsBySlug(treeSlug);

  if (!details) {
    return (
      <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
        <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />
        <main className="mx-auto mt-4 max-w-[1100px] px-4 md:px-6">
          <section className="border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tree not found</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The requested tree information is unavailable.</p>
            <Link className="mt-4 inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" to="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const recommendation = location.state?.recommendation;
  const cityName = location.state?.cityName;

  return (
    <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />

      <main className="mx-auto mt-4 grid max-w-[1100px] gap-4 px-4 md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{details.commonName}</h2>
                <p className="text-sm italic text-slate-500 dark:text-slate-400">{details.scientificName}</p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {(cityName || recommendation) && (
            <div className="mb-4 grid gap-3 border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/70 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Context City</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{cityName || "All Cities Baseline"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommendation Match</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{typeof recommendation?.match === "number" ? `${recommendation.match}%` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Estimated Carbon</p>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{typeof recommendation?.carbon === "number" ? `${recommendation.carbon} kg/y` : "N/A"}</p>
              </div>
            </div>
          )}

          <div className="grid gap-2 md:grid-cols-2">
            {detailRows.map((row) => (
              <article key={row.key} className="border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{row.label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{details[row.key]}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
