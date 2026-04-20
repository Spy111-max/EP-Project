import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2, MoonStar, ShieldCheck, Sun } from "lucide-react";

export default function Navbar({ darkMode, onToggleDarkMode, cityCount }) {
  const [timestamp, setTimestamp] = useState(() =>
    new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimestamp(
        new Date().toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 isolate border-b border-brand-900 bg-[#12243f] text-slate-100 shadow-[0_14px_36px_-28px_rgba(2,6,23,0.95)] transition-colors duration-300">
      <div className="border-b border-slate-700 bg-brand-700 px-4 py-1.5 text-[11px] md:px-6">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-slate-100">
            <ShieldCheck className="h-3.5 w-3.5" />
              Forestry & Climate Department
          </div>
          <div className="hidden items-center gap-2 text-slate-200 md:flex">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-stable-600" />
            {cityCount} cities online
          </div>
          <label className="inline-flex items-center gap-2">
            <Globe2 className="h-3.5 w-3.5" />
            <select className="border border-slate-600 bg-slate-950 px-1.5 py-0.5 text-[11px] text-slate-100 outline-none">
              <option>EN</option>
            </select>
          </label>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid h-12 w-12 place-content-center border border-brand-400 bg-brand-700 text-white shadow-card"
          >
            <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <ShieldCheck className="h-5 w-5" />
            </motion.div>
          </motion.div>
          <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">Command Center</p>
              <h1 className="text-base font-bold text-white md:text-lg">Environmental Monitoring Dashboard</h1>
            <p className="text-[11px] text-slate-300">Home &gt; Data &amp; Statistics &gt; Air Quality &amp; Reforestation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200 md:flex">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-stable-600" />
            Last Updated: {timestamp}
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="border border-slate-700 bg-slate-900 p-2 text-slate-100 transition hover:bg-slate-800"
            title="Toggle color mode"
            aria-label="Toggle color mode"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
