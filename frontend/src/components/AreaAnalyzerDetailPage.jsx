import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import Navbar from "./Navbar";
import AreaAnalyzerPanel from "./AreaAnalyzerPanel";

export default function AreaAnalyzerDetailPage({ darkMode, onToggleDarkMode, cityCount }) {
  return (
    <div className="relative isolate min-h-screen bg-slate-100 pb-6 dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} cityCount={cityCount} />

      <main className="relative z-0 mx-auto mt-4 grid max-w-[1200px] gap-4 px-4 md:px-6">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-content-center border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Area Analyzer</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Area-level feasibility for exact tree planting pockets in Pune</p>
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

          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            This screen provides micro-area planting feasibility and excludes non-plantable surfaces such as concrete forecourts,
            building footprints, slab zones, and utility-clearance strips.
          </p>
        </motion.section>

        <AreaAnalyzerPanel selectedCity={{ id: "pune", name: "Pune" }} />
      </main>
    </div>
  );
}
