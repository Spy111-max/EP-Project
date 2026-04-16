import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { cardHover } from "../animations/variants";

const RANGE_WINDOWS = {
  "1D": 1,
  "1W": 2,
  "1M": 3,
  "1Y": 6,
};

function exportCsv(rows, filename) {
  const headers = ["Month", "PM2.5", "PM10", "AQI", "TreeDensityProxy"];
  const csvRows = rows.map((row) => [row.month, row.pm25, row.pm10, row.aqi, row.treeDensityProxy].join(","));
  const blob = new Blob([[headers.join(","), ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportPdf(title, cityName, range) {
  const win = window.open("", "_blank", "width=920,height=720");
  if (!win) return;

  win.document.write(`
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: Inter, Arial, sans-serif; padding: 24px; color: #0f172a; background: #f8fafc;">
        <h2 style="margin: 0 0 8px;">${title}</h2>
        <p style="margin: 0 0 4px;">City: ${cityName || "National View"}</p>
        <p style="margin: 0 0 16px;">Range: ${range}</p>
        <p style="font-size: 12px; color: #475569;">Source: Department of Environmental Statistics, 2026.</p>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function ChartCard({ title, subtitle, cityName, range, data, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={cardHover}
      transition={{ duration: 0.28 }}
      className="border border-slate-300 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCsv(data, `${title.toLowerCase().replace(/\s+/g, "-")}-${range.toLowerCase()}.csv`)}
            className="border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            Download CSV
          </button>
          <button
            onClick={() => exportPdf(title, cityName, range)}
            className="border border-brand-700 bg-brand-800 px-2 py-1 text-[11px] font-semibold text-white hover:bg-brand-900"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="h-64 border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">{children}</div>

      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Source: Department of Environmental Statistics, 2026.</p>
    </motion.section>
  );
}

export default function ChartSection({ trendData, selectedCity }) {
  const [range, setRange] = useState("1Y");
  const windowSize = RANGE_WINDOWS[range];
  const slicedData = windowSize && trendData ? trendData.slice(-windowSize) : trendData || [];
  const processedData = useMemo(
    () => slicedData.map((row) => ({ ...row, treeDensityProxy: Math.max(40, 220 - row.pm10) })),
    [slicedData],
  );

  if (!processedData || processedData.length === 0) {
    return (
      <section className="border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">Comparison Charts</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Time-series and comparative indicators</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Select a city to load pollution trend graphs.</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <section className="border border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Time Series</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(RANGE_WINDOWS).map((value) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`border px-2 py-1 text-[11px] font-semibold transition ${
                range === value
                  ? "border-brand-700 bg-brand-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <ChartCard
        title="Regional Pollution Intensity"
        subtitle="Vertical distribution of PM10 and PM2.5"
        cityName={selectedCity?.name}
        range={range}
        data={processedData}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(100,116,139,0.35)" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
            <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#cbd5e1", background: "#fff" }} />
            <Legend />
            <Bar dataKey="pm10" name="PM10" fill="#1b365d" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={850} animationEasing="ease-out" />
            <Bar dataKey="pm25" name="PM2.5" fill="#2563eb" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Pollution vs Tree Density"
        subtitle="Inverse trend indicator by month"
        cityName={selectedCity?.name}
        range={range}
        data={processedData}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(100,116,139,0.35)" />
            <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={{ stroke: "#cbd5e1" }} />
            <Tooltip contentStyle={{ borderRadius: 0, borderColor: "#cbd5e1", background: "#fff" }} />
            <Legend />
            <Bar dataKey="aqi" name="AQI" fill="#dc2626" radius={[2, 2, 0, 0]} isAnimationActive animationDuration={900} animationEasing="ease-out" />
            <Bar
              dataKey="treeDensityProxy"
              name="Tree Density Index"
              fill="#059669"
              radius={[2, 2, 0, 0]}
              isAnimationActive
              animationDuration={950}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
