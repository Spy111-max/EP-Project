import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { cardHover } from "../animations/variants";
import { generateAreaReportPdf } from "../utils/reportPdf";

export default function AreaOverviewReport({ city, insight, recommendations }) {
  if (!city || !insight) return null;

  const latestTrend = insight.trendData?.[insight.trendData.length - 1];
  const actionPlan = insight.actionPlan;

  const summaryParagraph =
    `${city.name} is currently being monitored as a ${city.state} area with PM2.5, PM10, and PM1 values captured in the dashboard. ` +
    `The latest AQI trend is ${latestTrend?.aqi ?? "not available"}, and the selected tree set is intended to improve particulate capture and heat mitigation over time.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={{ duration: 0.28 }}
      className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Area Overview Report</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Paragraph-based summary for the selected area.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <p>{summaryParagraph}</p>
        <p>
          Recommended species for this area are prioritized for pollutant absorption, local climate fit, and long-term canopy
          performance. The selection is meant to support a practical reduction strategy rather than a visual-only planting plan.
        </p>
        <p>
          Tree recommendations are shown before the download action so the likely planting response is visible first. This keeps the
          report focused on what to plant before exporting it.
        </p>
        <p>
          {actionPlan?.summary ||
            "The suggested action plan focuses on source reduction, roadside greening, watering discipline, and staged maintenance so the planting program can deliver measurable pollution relief."}
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() =>
            generateAreaReportPdf({
              cityName: city.name,
              stateName: city.state,
              summaryCards: insight.summaryCards,
              trendData: insight.trendData,
              recommendations,
              actionPlan,
            })
          }
          className="inline-flex items-center gap-2 border border-brand-700 bg-brand-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>
    </motion.section>
  );
}
