# PSAS Dashboard UI (React + Tailwind)

This module is a redesigned dashboard UI for **Pollution-Driven Smart Afforestation System (PSAS)**.

## Improved Layout Structure

1. **Top Navbar**
   - App identity (logo + title)
   - Dark mode toggle
   - Refresh action with loading state

2. **2-Column Desktop Grid**
   - Center: AQI cards, trend charts, map preview
   - Right: Tree recommendation cards

3. **Mobile Adaptation**
   - Grid collapses into stacked sections
   - Cards remain readable with maintained spacing

## UX Design Choices

- Soft palette using green/blue/earth tones for environmental readability.
- AQI cards use color-coded state bands: Green, Yellow, Orange, Red.
- Loading skeletons keep perceived performance smooth while data is fetched.
- Recharts tooltips improve data interpretation.
- Framer Motion adds subtle reveal, stagger, and hover transitions.
- Dark mode persists via localStorage.

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL shown in terminal.

## Build

```bash
npm run build
```

## Replace Mock Data With Real API

- Current data source: `src/data/mockDashboardData.js`
- Recommended integration point: `src/App.jsx` inside the fetch simulation effect.

Example backend endpoints to wire:
- `/api/hotspots`
- `/api/recommendations`
- `/api/impact`

## Key Files

- `src/App.jsx`: dashboard composition and layout shell
- `src/components/Navbar.jsx`: top navigation
- `src/components/AQISummaryGrid.jsx`: AQI summary cards wrapper
- `src/components/ChartSection.jsx`: pollution trend visualizations
- `src/components/MapPreview.jsx`: leaflet map preview
- `src/components/TreeRecommendationsPanel.jsx`: recommendation list
