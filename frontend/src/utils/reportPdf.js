import jsPDF from "jspdf";

function addWrappedParagraph(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc, title, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, x, y);
  return y + 7;
}

export function generateAreaReportPdf({ cityName, stateName, summaryCards, trendData, recommendations, actionPlan }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 18;

  const ensureSpace = (needed = 18) => {
    if (cursorY + needed > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(`${cityName} Area Overview Report`, margin, cursorY);
  cursorY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Prepared for ${stateName || "the selected area"}`, margin, cursorY);
  cursorY += 10;

  const pm25 = summaryCards?.find((card) => card.id === "pm25")?.value;
  const pm10 = summaryCards?.find((card) => card.id === "pm10")?.value;
  const pm1 = summaryCards?.find((card) => card.id === "pm1")?.value;
  const latestTrend = trendData?.[trendData.length - 1];
  const previousTrend = trendData?.[trendData.length - 2];

  const pollutionParagraph =
    `${cityName} currently shows PM2.5 at ${pm25 ?? "N/A"} ug/m3, PM10 at ${pm10 ?? "N/A"} ug/m3, and PM1 at ${pm1 ?? "N/A"} ug/m3. ` +
    `The latest trend indicates ${latestTrend ? `AQI around ${latestTrend.aqi}` : "no available trend data"}${
      latestTrend && previousTrend
        ? `, with the prior month recorded at ${previousTrend.aqi}, showing a ${latestTrend.aqi - previousTrend.aqi >= 0 ? "rise" : "drop"} of ${Math.abs(latestTrend.aqi - previousTrend.aqi)} points.`
        : "."
    }`;

  const recommendationNames = (recommendations || []).map((item) => item.commonName).join(", ");
  const treeParagraph = recommendationNames
    ? `The current tree recommendation set prioritizes ${recommendationNames}. These species are selected to improve particulate capture, shade performance, and long-term resilience in this area.`
    : "The current tree recommendation set is unavailable for this area.";

  const actionParagraph = actionPlan?.summary
    ? actionPlan.summary
    : "The action plan focuses on reducing particulate load through road-edge greening, source control, watering discipline, and maintenance scheduling.";

  cursorY = addSectionTitle(doc, "Overview", margin, cursorY);
  ensureSpace(30);
  cursorY = addWrappedParagraph(doc, pollutionParagraph, margin, cursorY, contentWidth);
  cursorY += 4;
  cursorY = addWrappedParagraph(doc, treeParagraph, margin, cursorY, contentWidth);
  cursorY += 8;

  cursorY = addSectionTitle(doc, "Recommended Next Steps", margin, cursorY);
  ensureSpace(40);
  cursorY = addWrappedParagraph(doc, actionParagraph, margin, cursorY, contentWidth);
  cursorY += 4;

  if (actionPlan?.steps?.length) {
    doc.setFontSize(10);
    actionPlan.steps.forEach((step, index) => {
      ensureSpace(14);
      cursorY = addWrappedParagraph(doc, `${index + 1}. ${step}`, margin, cursorY, contentWidth);
    });
  }

  cursorY += 4;
  cursorY = addSectionTitle(doc, "Current Tree Notes", margin, cursorY);
  ensureSpace(34);

  const detailLines = [
    `Selected area: ${cityName}`,
    `Recommendation count: ${recommendations?.length || 0}`,
    `Latest AQI trend: ${latestTrend?.aqi ?? "N/A"}`,
  ];

  detailLines.forEach((line) => {
    ensureSpace(8);
    cursorY = addWrappedParagraph(doc, line, margin, cursorY, contentWidth);
  });

  const safeFileName = String(cityName || "area")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  doc.save(`${safeFileName}-area-overview-report.pdf`);
}
