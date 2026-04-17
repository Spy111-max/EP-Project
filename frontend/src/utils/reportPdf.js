import jsPDF from "jspdf";

function wrapText(doc, text, width) {
  return doc.splitTextToSize(text, width);
}

function measureTextHeight(doc, lines, lineHeight) {
  return lines.length * lineHeight;
}

function measureParagraphBlockHeight(doc, text, width, lineHeight = 6.5) {
  const lines = wrapText(doc, text, width);
  return measureTextHeight(doc, lines, lineHeight);
}

function measureBulletsHeight(doc, items, width, lineHeight = 6.5) {
  return items.reduce((height, item) => {
    const lines = wrapText(doc, `1. ${item}`, width);
    return height + measureTextHeight(doc, lines, lineHeight) + 2;
  }, 0);
}

function drawHeaderBand(doc, pageWidth, margin, title, subtitle) {
  doc.setFillColor(27, 54, 93);
  doc.roundedRect(margin, 12, pageWidth - margin * 2, 28, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(title, margin + 6, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(subtitle, margin + 6, 32);

  doc.setTextColor(15, 23, 42);
}

function drawSectionBox(doc, { x, y, w, h, title, titleSize = 14 }) {
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(titleSize);
  doc.text(title, x + 5, y + 8);
}

function addParagraphsToBox(doc, { paragraphs, x, y, width, lineHeight = 6.5, fontSize = 12 }) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  let cursorY = y;
  paragraphs.forEach((paragraph, index) => {
    const lines = wrapText(doc, paragraph, width);
    doc.text(lines, x, cursorY);
    cursorY += measureTextHeight(doc, lines, lineHeight);
    if (index !== paragraphs.length - 1) cursorY += 2;
  });

  return cursorY;
}

function addBulletListToBox(doc, { items, x, y, width, lineHeight = 6.5, fontSize = 12 }) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  let cursorY = y;
  items.forEach((item, index) => {
    const bulletText = `${index + 1}. ${item}`;
    const lines = wrapText(doc, bulletText, width);
    doc.text(lines, x, cursorY);
    cursorY += measureTextHeight(doc, lines, lineHeight) + 2;
  });

  return cursorY;
}

export function generateAreaReportPdf({ cityName, stateName, summaryCards, trendData, recommendations, actionPlan }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const subtitle = `Prepared for ${stateName || "the selected area"}`;
  const headerBottom = 40;
  const bodyFontSize = 12;
  const bodyLineHeight = 6.5;

  const pm25 = summaryCards?.find((card) => card.id === "pm25")?.value;
  const pm10 = summaryCards?.find((card) => card.id === "pm10")?.value;
  const pm1 = summaryCards?.find((card) => card.id === "pm1")?.value;
  const latestTrend = trendData?.[trendData.length - 1];
  const previousTrend = trendData?.[trendData.length - 2];
  const recommendationNames = (recommendations || []).map((item) => item.commonName).join(", ");

  const pollutionParagraph =
    `${cityName} currently shows PM2.5 at ${pm25 ?? "N/A"} ug/m3, PM10 at ${pm10 ?? "N/A"} ug/m3, and PM1 at ${pm1 ?? "N/A"} ug/m3. ` +
    `The latest trend indicates ${latestTrend ? `AQI around ${latestTrend.aqi}` : "no available trend data"}${
      latestTrend && previousTrend
        ? `, with the prior month recorded at ${previousTrend.aqi}, showing a ${latestTrend.aqi - previousTrend.aqi >= 0 ? "rise" : "drop"} of ${Math.abs(latestTrend.aqi - previousTrend.aqi)} points.`
        : "."
    }`;

  const treeParagraph = recommendationNames
    ? `The current tree recommendation set prioritizes ${recommendationNames}. These species are selected to improve particulate capture, shade performance, and long-term resilience in this area.`
    : "The current tree recommendation set is unavailable for this area.";

  const actionParagraph = actionPlan?.summary
    ? actionPlan.summary
    : "The action plan focuses on reducing particulate load through road-edge greening, source control, watering discipline, and maintenance scheduling.";

  const cityNotes = [
    `Selected area: ${cityName}`,
    `Recommendation count: ${recommendations?.length || 0}`,
    `Latest AQI trend: ${latestTrend?.aqi ?? "N/A"}`,
    `This report is tied to the active dashboard selection and is intended to support the immediate mitigation response for the chosen area.`,
  ];

  drawHeaderBand(doc, pageWidth, margin, `${cityName} Area Overview Report`, subtitle);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(bodyFontSize);

  const overviewBodyWidth = contentWidth - 10;
  const overviewBoxHeight = 12 + measureParagraphBlockHeight(doc, pollutionParagraph, overviewBodyWidth, bodyLineHeight) + 2 + measureParagraphBlockHeight(doc, treeParagraph, overviewBodyWidth, bodyLineHeight) + 8;
  const overviewBoxY = headerBottom + 4;
  drawSectionBox(doc, { x: margin, y: overviewBoxY, w: contentWidth, h: overviewBoxHeight, title: "Overview" });
  addParagraphsToBox(doc, {
    paragraphs: [pollutionParagraph, treeParagraph],
    x: margin + 5,
    y: overviewBoxY + 16,
    width: overviewBodyWidth,
    lineHeight: bodyLineHeight,
    fontSize: bodyFontSize,
  });

  const snapshotParagraphs = [
    `PM2.5 is currently ${pm25 ?? "N/A"} ug/m3, PM10 is ${pm10 ?? "N/A"} ug/m3, and PM1 is ${pm1 ?? "N/A"} ug/m3.`,
    `The city trend currently points to AQI ${latestTrend?.aqi ?? "N/A"} and acts as the reference point for the current planning cycle.`,
  ];
  const snapshotBoxHeight = 12 + snapshotParagraphs.reduce((height, paragraph) => height + measureParagraphBlockHeight(doc, paragraph, overviewBodyWidth, bodyLineHeight) + 2, 0) + 4;
  const snapshotBoxY = overviewBoxY + overviewBoxHeight + 5;
  drawSectionBox(doc, { x: margin, y: snapshotBoxY, w: contentWidth, h: snapshotBoxHeight, title: "Current Pollutant Snapshot" });
  addParagraphsToBox(doc, {
    paragraphs: snapshotParagraphs,
    x: margin + 5,
    y: snapshotBoxY + 16,
    width: overviewBodyWidth,
    lineHeight: bodyLineHeight,
    fontSize: bodyFontSize,
  });

  doc.addPage();
  drawHeaderBand(doc, pageWidth, margin, `${cityName} Area Overview Report`, subtitle);

  const nextStepsParagraphs = [
    actionParagraph,
    "The tree recommendations are intended to reduce pollutant concentration, improve shade, and stabilize the local planting response over time.",
  ];
  const nextStepsItems = actionPlan?.steps?.length
    ? actionPlan.steps
    : [
        "Prioritize roadside canopy creation around the highest pollution corridors.",
        "Use monsoon planting windows and protective mulch rings for young saplings.",
        "Pair plantation work with dust-source control and regular cleaning cycles.",
        "Measure the follow-up PM values after each planting phase and replace failures quickly.",
      ];

  const nextStepsBoxHeight =
    12 +
    nextStepsParagraphs.reduce((height, paragraph) => height + measureParagraphBlockHeight(doc, paragraph, contentWidth - 10, bodyLineHeight) + 2, 0) +
    measureBulletsHeight(doc, nextStepsItems, contentWidth - 10, bodyLineHeight) +
    8;
  const nextStepsBoxY = headerBottom + 4;
  drawSectionBox(doc, { x: margin, y: nextStepsBoxY, w: contentWidth, h: nextStepsBoxHeight, title: "Recommended Next Steps" });
  addParagraphsToBox(doc, {
    paragraphs: [
      ...nextStepsParagraphs,
    ],
    x: margin + 5,
    y: nextStepsBoxY + 16,
    width: contentWidth - 10,
    lineHeight: bodyLineHeight,
    fontSize: bodyFontSize,
  });
  addBulletListToBox(doc, {
    items: nextStepsItems,
    x: margin + 5,
    y: nextStepsBoxY + 16 + nextStepsParagraphs.reduce((height, paragraph) => height + measureParagraphBlockHeight(doc, paragraph, contentWidth - 10, bodyLineHeight) + 2, 0),
    width: contentWidth - 10,
    lineHeight: bodyLineHeight,
    fontSize: bodyFontSize,
  });

  const notesBoxY = nextStepsBoxY + nextStepsBoxHeight + 5;
  const notesBoxH = 12 + cityNotes.reduce((height, note) => height + measureParagraphBlockHeight(doc, note, contentWidth - 10, bodyLineHeight) + 2, 0) + 4;
  drawSectionBox(doc, { x: margin, y: notesBoxY, w: contentWidth, h: notesBoxH, title: "Current Tree Notes" });
  addParagraphsToBox(doc, {
    paragraphs: cityNotes,
    x: margin + 5,
    y: notesBoxY + 16,
    width: contentWidth - 10,
    lineHeight: bodyLineHeight,
    fontSize: bodyFontSize,
  });

  const safeFileName = String(cityName || "area")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  doc.save(`${safeFileName}-area-overview-report.pdf`);
}
