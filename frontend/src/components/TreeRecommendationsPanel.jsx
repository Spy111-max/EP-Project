import { motion } from "framer-motion";
import TreeRecommendationCard from "./TreeRecommendationCard";
import { cardHover } from "../animations/variants";

export default function TreeRecommendationsPanel({ recommendations, onOpenTreeDetails }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Tree Recommendations</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select a city first to generate location-aware species recommendations.</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={{ duration: 0.3 }}
      className="border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/40">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Tree Recommendations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Species prioritized for current pollution and land context</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <span>{recommendations.length} candidates</span>
        <span>Source: Department of Environmental Statistics, 2026.</span>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-1">
        {recommendations.map((item, index) => (
          <TreeRecommendationCard
            key={item.id}
            item={item}
            index={index}
            onOpenDetails={onOpenTreeDetails}
          />
        ))}
      </div>
    </motion.section>
  );
}
