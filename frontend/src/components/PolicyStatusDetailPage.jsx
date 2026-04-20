import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "./Navbar";
import { policyStatusGuide } from "../data/environment/forestryInitiativesData";
import { getPolicyStatusRows } from "../utils/cityEnvironmentalMetrics";

export default function PolicyStatusDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  const rows = getPolicyStatusRows();

  const statusCounts = rows.reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />
      <main className="mx-auto mt-4 grid max-w-[1200px] gap-4 px-4 md:px-6">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-700 dark:bg-warning-900/30 dark:text-warning-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Policy Status</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Implementation phase and enforcement context</p>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>{policyStatusGuide.definition}</p>
            <p>The current cycle is marked as {policyStatusGuide.currentCycleStatus}.</p>
            <p>
              Status progression typically moves from planning to phase-based execution and then into stabilization, where survival and compliance are tracked continuously.
            </p>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {policyStatusGuide.statusScale.map((line) => (
              <article key={line} className="border border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                {line}
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Current Phase Distribution</h3>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <article key={status} className="border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{status}</p>
                <p className="mt-1 text-2xl font-extrabold text-warning-700 dark:text-warning-300">{count}</p>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">City Policy Notes</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Each city is listed as a standalone policy summary card, not in table format.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((city) => (
              <article key={city.id} className="border border-slate-300 bg-gradient-to-br from-amber-100 to-amber-50 p-3 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:to-slate-800">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{city.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{city.state}</p>
                <p className="mt-2 text-lg font-semibold text-warning-700 dark:text-warning-300">{city.status}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {city.name} currently maps to {city.status} based on monitoring pressure, execution stage, and compliance priority in the present cycle.
                </p>
              </article>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
