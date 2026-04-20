import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import AQIDetailPage from "./components/AQIDetailPage";
import AreaAnalyzerDetailPage from "./components/AreaAnalyzerDetailPage";
import ForestCoverageDetailPage from "./components/ForestCoverageDetailPage";
import PolicyStatusDetailPage from "./components/PolicyStatusDetailPage";
import PollutantDetailPage from "./components/PollutantDetailPage";
import TreeDetailPage from "./components/TreeDetailPage";
import TreePlantationsDetailPage from "./components/TreePlantationsDetailPage";
import { cityCatalog } from "./data/mockDashboardData";
import "./index.css";

function RoutedApp() {
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem("psas-dark-mode");
		const shouldEnable = stored === "true";
		setDarkMode(shouldEnable);
		document.documentElement.classList.toggle("dark", shouldEnable);
	}, []);

	function toggleDarkMode() {
		setDarkMode((prev) => {
			const next = !prev;
			localStorage.setItem("psas-dark-mode", String(next));
			document.documentElement.classList.toggle("dark", next);
			return next;
		});
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />} />
				<Route path="/aqi" element={<AQIDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />} />
				<Route path="/area-analyzer" element={<AreaAnalyzerDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />} />
				<Route
					path="/forest-coverage"
					element={<ForestCoverageDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />}
				/>
				<Route
					path="/tree-plantations"
					element={<TreePlantationsDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />}
				/>
				<Route
					path="/policy-status"
					element={<PolicyStatusDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />}
				/>
				<Route
					path="/pollutants/:pollutantKey"
					element={<PollutantDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />}
				/>
				<Route
					path="/trees/:treeSlug"
					element={<TreeDetailPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} cityCount={cityCatalog.length} />}
				/>
			</Routes>
		</BrowserRouter>
	);
}

function mountGlobalErrorView(message) {
	const root = document.getElementById("root");
	if (!root) return;
	root.innerHTML = `
		<div style="padding:16px;font-family:Inter,Arial,sans-serif;color:#0f172a;background:#f8fafc;min-height:100vh;">
			<h1 style="margin:0;font-size:18px;font-weight:700;">Startup Error</h1>
			<p style="margin-top:8px;font-size:14px;">Application failed to initialize.</p>
			<pre style="margin-top:12px;padding:12px;border:1px solid #cbd5e1;background:#ffffff;white-space:pre-wrap;">${message}</pre>
		</div>
	`;
}

window.addEventListener("error", (event) => {
	console.error("Global error:", event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
	console.error("Unhandled rejection:", event.reason);
});

try {
	ReactDOM.createRoot(document.getElementById("root")).render(
		<AppErrorBoundary>
			<RoutedApp />
		</AppErrorBoundary>,
	);
} catch (error) {
	mountGlobalErrorView(String(error?.stack || error));
}
