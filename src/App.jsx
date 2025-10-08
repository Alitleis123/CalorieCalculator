import { useMemo, useState } from "react";
import "./App.css";

/* ---------------- Data ---------------- */
const ACTIVITY_LEVELS = [
  { value: "1.2", label: "Sedentary (little or no exercise)" },
  { value: "1.375", label: "Light (1–3 days/week)" },
  { value: "1.55", label: "Moderate (3–5 days/week)" },
  { value: "1.725", label: "Very active (6–7 days/week)" },
  { value: "1.9", label: "Extra active (hard training/physical job)" },
];

/* ---------------- Utils ---------------- */
function toMetric({ unitSystem, weight, heightCm, heightFt, heightIn }) {
  if (unitSystem === "metric") {
    return { kg: Number(weight) || 0, cm: Number(heightCm) || 0 };
  }
  const lbs = Number(weight) || 0;
  const ft = Number(heightFt) || 0;
  const inch = Number(heightIn) || 0;
  const totalInches = ft * 12 + inch;
  return { kg: lbs * 0.45359237, cm: totalInches * 2.54 };
}
function mifflinStJeorBMR({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

/* ---------------- App ---------------- */
export default function App() {
  // inputs
  const [unitSystem, setUnitSystem] = useState("metric");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [showCredits, setShowCredits] = useState(false);

  // derived values
  const { kg, cm } = useMemo(
    () => toMetric({ unitSystem, weight, heightCm, heightFt, heightIn }),
    [unitSystem, weight, heightCm, heightFt, heightIn]
  );

  const bmr = useMemo(() => {
    const a = Number(age) || 0;
    if (kg <= 0 || cm <= 0 || a <= 0) return 0;
    return Math.max(0, Math.round(mifflinStJeorBMR({ sex, kg, cm, age: a })));
  }, [sex, kg, cm, age]);

  const tdee = useMemo(
    () => (bmr ? Math.round(bmr * Number(activity)) : 0),
    [bmr, activity]
  );

  /* ---------------- UI ---------------- */
  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar glass">
        <div className="brand">
          <span className="brand-dot" />
          CalorieCalc
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href="https://github.com/Alitleis123/CalorieCalculator"
            target="_blank"
            rel="noreferrer"
            className="button ghost"
            aria-label="Open GitHub repository"
          >
            GitHub ↗
          </a>
        </div>
      </nav>

      {/* Card */}
      <div className="card card-hover card-xl">
        <h1 className="hero-title gradient-text">
          Calorie Maintenance Calculator
        </h1>
        <p className="muted" style={{ marginBottom: 22 }}>
          Uses the Mifflin–St Jeor equation to estimate BMR and TDEE.
        </p>

        {/* Units */}
        <div className="radio-row">
          <label className="field-label">Units</label>
          <div className="seg" role="tablist" aria-label="Units selector">
            <button
              type="button"
              role="tab"
              aria-pressed={unitSystem === "metric"}
              aria-selected={unitSystem === "metric"}
              onClick={() => setUnitSystem("metric")}
            >
              Metric (kg, cm)
            </button>
            <button
              type="button"
              role="tab"
              aria-pressed={unitSystem === "imperial"}
              aria-selected={unitSystem === "imperial"}
              onClick={() => setUnitSystem("imperial")}
            >
              Imperial (lb, ft/in)
            </button>
          </div>
        </div>

        {/* Sex & Age */}
        <div className="grid-2">
          <div>
            <label className="field-label">Sex</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="field-label">Age (years)</label>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 28"
            />
          </div>
        </div>

        {/* Weight + Height */}
        <div className="stack-16">
          <div>
            <label className="field-label">
              Weight {unitSystem === "metric" ? "(kg)" : "(lb)"}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unitSystem === "metric" ? "70" : "154"}
            />
          </div>

          {unitSystem === "metric" ? (
            <div>
              <label className="field-label">Height (cm)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="175"
              />
            </div>
          ) : (
            <div className="grid-2" style={{ marginBottom: 0 }}>
              <div>
                <label className="field-label">Height (ft)</label>
                <input
                  type="number"
                  min="0"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="field-label">Height (in)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="9"
                />
              </div>
            </div>
          )}

          {/* Activity */}
          <div>
            <label className="field-label">Activity level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Tip: choose the level that best matches a typical week.
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="auto-grid" style={{ marginTop: 24 }}>
          <div className="tile">
            <div className="label">BMR</div>
            <div className="value">{bmr ? `${bmr} kcal/day` : "—"}</div>
          </div>
          <div className="tile">
            <div className="label">Maintenance (TDEE)</div>
            <div className="value">{tdee ? `${tdee} kcal/day` : "—"}</div>
          </div>
        </div>

        <p className="note">
          Note: This is an estimate. Individual needs vary due to metabolism,
          body composition, and other factors.
        </p>
      </div>

      {showCredits && (
        <div className="modal-backdrop" onClick={() => setShowCredits(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Credits</div>
              <button className="close-btn" onClick={() => setShowCredits(false)}>Close</button>
            </div>
            <div className="modal-body">
              Built by <strong>Ali Tileis</strong>. UI/UX, React + Vite.
              <br />
              GitHub: <a href="https://github.com/Alitleis123" target="_blank" rel="noreferrer">@Alitleis123</a>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <a
          href="https://en.wikipedia.org/wiki/Basal_metabolic_rate#Mifflin%E2%80%93St_Jeor_equation"
          target="_blank"
          rel="noreferrer"
        >
          Mifflin–St Jeor formula
        </a>
        {" · "}Activity multipliers: 1.2–1.9 {" · "}
        <button className="close-btn" style={{ padding: "4px 10px", marginLeft: 6 }} onClick={() => setShowCredits(true)}>Credits</button>
      </footer>
    </div>
  );
}