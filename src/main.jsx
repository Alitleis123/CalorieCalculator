// src/main.jsx
import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

/* ---------- Ultra-fast theme bootstrap (no flash) ---------- */
(() => {
  try {
    const KEY = "theme";
    const stored = localStorage.getItem(KEY);
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = stored || (prefersDark ? "dark" : "dark"); // default dark (blue/black)
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

/* ---------- Lazy app (smaller initial parse = snappier) ---------- */
const App = React.lazy(() => import("./App.jsx"));

/* ---------- Error Boundary (no white screen) ---------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    // Hook up to analytics if you like
    console.error("App crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "min(640px, 92%)",
              border: "1px solid rgba(106,168,255,0.25)",
              borderRadius: 16,
              padding: 24,
              background:
                "linear-gradient(180deg, rgba(9,18,36,.85), rgba(10,16,30,.75))",
              boxShadow: "0 24px 60px rgba(0,0,0,.55)",
              color: "var(--text, #e8ecf3)",
            }}
          >
            <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>
              Something went wrong
            </h1>
            <p style={{ opacity: 0.8, lineHeight: 1.5 }}>
              Please refresh the page. If the issue persists, report your steps
              so we can fix it fast.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- Featherweight skeleton (no lag, no layout shift) ---------- */
const Fallback = () => (
  <div
    style={{
      minHeight: "100svh",
      display: "grid",
      placeItems: "center",
      padding: "clamp(24px, 5vw, 48px)",
      background:
        "radial-gradient(1000px 700px at 10% -10%, #0f1e38 0%, transparent 40%), #0b1220",
    }}
  >
    <div
      aria-hidden
      style={{
        width: "min(1100px, 92%)",
        borderRadius: 18,
        border: "1px solid rgba(106,168,255,0.18)",
        background:
          "linear-gradient(180deg, rgba(14,22,44,.7), rgba(12,19,36,.6))",
        boxShadow: "0 22px 60px rgba(0,0,0,.55)",
        padding: "28px clamp(16px, 3vw, 32px)",
      }}
    >
      {/* shimmering header bar */}
      <div
        style={{
          height: 18,
          width: "60%",
          borderRadius: 8,
          background:
            "linear-gradient(90deg, rgba(120,170,255,.22), rgba(120,170,255,.08), rgba(120,170,255,.22))",
          backgroundSize: "200% 100%",
          animation: "sh 1.2s linear infinite",
          marginBottom: 14,
        }}
      />
      {/* input rows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 42,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(106,168,255,0.18)",
            }}
          />
        ))}
      </div>
      <div style={{ height: 42, borderRadius: 12, marginTop: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(106,168,255,0.18)" }} />
      <div style={{ height: 42, borderRadius: 12, marginTop: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(106,168,255,0.18)" }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0,1fr))",
          gap: 14,
          marginTop: 18,
        }}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 88,
              borderRadius: 14,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.05))",
              border: "1px solid rgba(106,168,255,0.18)",
            }}
          />
        ))}
      </div>
    </div>

    {/* keyframes inline to keep fallback self-contained */}
    <style>{`
      @keyframes sh {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

/* ---------- Mount ---------- */
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);