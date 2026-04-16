import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

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
			<App />
		</AppErrorBoundary>,
	);
} catch (error) {
	mountGlobalErrorView(String(error?.stack || error));
}
