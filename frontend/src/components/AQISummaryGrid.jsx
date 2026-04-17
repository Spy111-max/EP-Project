import { AnimatePresence, motion } from "framer-motion";
import AQICard from "./AQICard";
import LoadingSkeleton from "./LoadingSkeleton";
import { sectionStaggerVariants, sectionVariants } from "../animations/variants";

export default function AQISummaryGrid({ cards, loading, onCardClick }) {
  if (!loading && (!cards || cards.length === 0)) {
    return (
      <section className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Pollutant Summary</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Select a city to view PM2.5, PM10, and PM1 summary cards.</p>
      </section>
    );
  }

  return (
    <motion.section variants={sectionStaggerVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="wait">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <motion.div key={`skeleton-${index}`} variants={sectionVariants} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton className="h-36 w-full" />
              </motion.div>
            ))
          : cards.map((card) => (
              <motion.div key={card.id} variants={sectionVariants}>
                <AQICard {...card} onClick={onCardClick ? () => onCardClick(card.id) : undefined} />
              </motion.div>
            ))}
      </AnimatePresence>
    </motion.section>
  );
}
