import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trees } from "lucide-react";
import Navbar from "./Navbar";
import { forestCoverageGuide } from "../data/environment/forestryInitiativesData";
import { getForestCoverageRows } from "../utils/cityEnvironmentalMetrics";

export default function ForestCoverageDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const cityRows = getForestCoverageRows();
  const averageCoverage = cityRows.length
    ? (cityRows.reduce((sum, city) => sum + city.forestCoverage, 0) / cityRows.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />
      <main className="mx-auto mt-4 grid max-w-[1200px] gap-4 px-4 md:px-6">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-stable-200 bg-stable-50 text-stable-700 dark:border-stable-700 dark:bg-stable-900/30 dark:text-stable-200">
                <Trees className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Forest Coverage %</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Coverage definition and city-level distribution</p>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>{forestCoverageGuide.whatItIs}</p>
            <p>{forestCoverageGuide.howItIsEstimated}</p>
          </div>

          <div className="mt-4 border border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Average Forest Coverage</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-stable-700 dark:text-stable-300">{averageCoverage}%</p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">City Coverage Notes</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Each city is shown as an individual block, not as a table.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {cityRows.map((city) => (
              <article key={city.id} className="border border-slate-300 bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{city.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{city.state}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-stable-700 dark:text-stable-300">{city.forestCoverage}%</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {city.name} currently tracks around {city.forestCoverage}% effective forest and canopy coverage under the current planning estimate.
                </p>
              </article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
