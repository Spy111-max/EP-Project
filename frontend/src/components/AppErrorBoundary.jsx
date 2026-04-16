import React from "react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "16px", fontFamily: "Inter, Arial, sans-serif", color: "#0f172a", background: "#f8fafc", minHeight: "100vh" }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Runtime Error</h1>
          <p style={{ marginTop: "8px", fontSize: "14px" }}>The dashboard failed to render. Please share this error text.</p>
          <pre style={{ marginTop: "12px", padding: "12px", border: "1px solid #cbd5e1", background: "#ffffff", whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.stack || this.state.error || "Unknown rendering error")}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
