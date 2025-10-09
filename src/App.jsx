import { useMemo, useState } from "react";
import "./App.css";

// --- BMI Scale (JSX only) ---
function BmiScale({ bmi }) {
  const MIN = 12;   // visualization range start
  const MAX = 40;   // visualization range end
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const clamped = clamp(Number(bmi) || 0, MIN, MAX);
  const pct = ((clamped - MIN) / (MAX - MIN)) * 100; // marker position 0–100

  // Medical category breakpoints
  const UNDER_END = 18.5;   // end of Underweight
  const NORMAL_END = 24.9;  // end of Normal

  const underPct = ((UNDER_END - MIN) / (MAX - MIN)) * 100;
  const normalEndPct = ((NORMAL_END - MIN) / (MAX - MIN)) * 100;

  return (
    <div
      className="bmi-scale"
      role="group"
      aria-label="BMI classification"
      // Expose key positions for CSS via custom properties
      style={{
        ['--pct']: `${pct}%`,
        ['--under']: '33.333%',
        ['--normalEnd']: '66.666%',
      }}
    >
      <div className="bmi-track" aria-hidden="true">
        {/* Full-width fill so gradient spans the entire bar */}
        <div className="bmi-fill" />
        {/* Dividers at category breakpoints */}
        <div className="bmi-divider" style={{ left: 'var(--under)' }} />
        <div className="bmi-divider" style={{ left: 'var(--normalEnd)' }} />
        {/* Marker */}
        <div className="bmi-thumb" style={{ left: `calc(${pct}% - 9px)` }} />
      </div>
      <div className="bmi-legend" aria-hidden="true">
        <span className="bmi-legend-item">Underweight</span>
        <span className="bmi-legend-item">Normal</span>
        <span className="bmi-legend-item">Overweight</span>
      </div>
    </div>
  );
}

/* ---------------- Data ---------------- */
const ACTIVITY_LEVELS = [
  { value: "1.2", label: "Sedentary (little or no exercise)" },
  { value: "1.375", label: "Light (1–3 days/week)" },
  { value: "1.55", label: "Moderate (3–5 days/week)" },
  { value: "1.725", label: "Very active (6–7 days/week)" },
  { value: "1.9", label: "Extra active (hard training/physical job)" },
];

// ---- unit conversion helpers ----
const kgToLb = (kg) => kg / 0.45359237;
const lbToKg = (lb) => lb * 0.45359237;
const cmToFtIn = (cm) => {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round((totalIn - ft * 12) * 10) / 10; // 1 decimal
  return { ft, inch };
};
const ftInToCm = (ft, inch) => (Number(ft) * 12 + Number(inch)) * 2.54;

function InfoIcon({ tip, onClick }) {
  return (
    <button
      type="button"
      className="info"
      aria-label={tip}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "18px",
        height: "18px",
        marginLeft: "6px",
        borderRadius: "50%",
        fontSize: "12px",
        lineHeight: "1",
        color: "inherit",
        background: "rgba(255,255,255,.1)",
        border: "1px solid rgba(255,255,255,.2)",
        cursor: "pointer",
        opacity: ".8",
        position: "relative",
        padding: 0,
      }}
    >
      ⓘ
    </button>
  );
}

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
  const [unitSystem, setUnitSystem] = useState("imperial");
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [activity, setActivity] = useState("1.2");

  const [infoModal, setInfoModal] = useState({ open: false, title: "", body: "" });

  const openInfo = (key) => {
    const map = {
      bmr: {
        title: "What is BMR?",
        body: "Basal Metabolic Rate is the energy your body uses at rest to keep vital functions running (breathing, circulation, cell repair).",
      },
      tdee: {
        title: "What is TDEE?",
        body: "Total Daily Energy Expenditure is an estimate of how many calories you burn per day including activity. It's BMR multiplied by an activity factor.",
      },
      bmi: {
        title: "What is BMI?",
        body: "Body Mass Index is a weight-to-height ratio (kg/m²). It's a general screening tool and doesn't capture body composition or distribution.",
      },
    };
    setInfoModal({ open: true, title: map[key].title, body: map[key].body });
  };

  const closeInfo = () => setInfoModal({ open: false, title: "", body: "" });

  const resetAll = () => {
    // clear any previously stored state/URL and reset fields
    try {
      localStorage.removeItem("calcState");
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState(null, "", url.toString());
    } catch {}
    setUnitSystem("metric");
    setSex("male");
    setAge("");
    setWeight("");
    setHeightCm("");
    setHeightFt("");
    setHeightIn("");
    setActivity("1.2");
  };

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

  const bmi = useMemo(() => {
    if (!kg || !cm) return 0;
    const m = cm / 100;
    return Math.round((kg / (m * m)) * 10) / 10;
  }, [kg, cm]);

  const goals = useMemo(() => {
    if (!tdee) return null;
    return {
      maintain: tdee,
      cut15: Math.round(tdee * 0.85),
      gain15: Math.round(tdee * 1.15),
    };
  }, [tdee]);

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
          <div className="seg" role="tablist" aria-label="Units selector" style={{ display: "inline-flex", gap: 0, padding: 4, borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)" }}>
            <button
              type="button"
              role="tab"
              aria-pressed={unitSystem === "imperial"}
              aria-selected={unitSystem === "imperial"}
              onClick={() => {
                if (unitSystem === "metric") {
                  const lbVal = weight ? kgToLb(Number(weight)) : "";
                  const { ft, inch } = heightCm
                    ? cmToFtIn(Number(heightCm))
                    : { ft: "", inch: "" };
                  setWeight(lbVal !== "" ? Math.round(lbVal) : "");
                  setHeightFt(ft || "");
                  setHeightIn(inch || "");
                }
                setUnitSystem("imperial");
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") e.currentTarget.previousSibling?.click();
              }}
              style={{
                appearance: "none",
                border: 0,
                padding: "10px 14px",
                borderRadius: 999,
                background:
                  unitSystem === "imperial"
                    ? "linear-gradient(180deg, rgba(120,170,255,.22), rgba(120,170,255,.12))"
                    : "transparent",
                color: "inherit",
                cursor: "pointer",
                transition: "background 160ms ease",
              }}
            >
              Imperial (lb, ft/in)
            </button>
            <button
              type="button"
              role="tab"
              aria-pressed={unitSystem === "metric"}
              aria-selected={unitSystem === "metric"}
              onClick={() => {
                if (unitSystem === "imperial") {
                  const kgVal = weight ? lbToKg(Number(weight)) : "";
                  const cmVal = (heightFt || heightIn)
                    ? ftInToCm(Number(heightFt || 0), Number(heightIn || 0))
                    : "";
                  setWeight(kgVal !== "" ? Math.round(kgVal * 10) / 10 : "");
                  setHeightCm(cmVal !== "" ? Math.round(cmVal) : "");
                }
                setUnitSystem("metric");
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") e.currentTarget.nextSibling?.click();
              }}
              style={{
                appearance: "none",
                border: 0,
                padding: "10px 14px",
                borderRadius: 999,
                background:
                  unitSystem === "metric"
                    ? "linear-gradient(180deg, rgba(120,170,255,.22), rgba(120,170,255,.12))"
                    : "transparent",
                color: "inherit",
                cursor: "pointer",
                transition: "background 160ms ease",
              }}
            >
              Metric (kg, cm)
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
              placeholder="Enter age"
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
              placeholder={unitSystem === "metric" ? "Enter weight" : "Enter weight"}
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
                placeholder="Enter height"
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
                  placeholder="Feet"
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
                  placeholder="Inches"
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
            <div className="label">BMR <InfoIcon tip="What is BMR?" onClick={() => openInfo('bmr')} /></div>
            <div className="value">{bmr ? `${bmr} kcal/day` : "—"}</div>
          </div>
          <div className="tile">
            <div className="label">Maintenance (TDEE) <InfoIcon tip="What is TDEE?" onClick={() => openInfo('tdee')} /></div>
            <div className="value">{tdee ? `${tdee} kcal/day` : "—"}</div>
          </div>
          <div className="tile">
            <div className="label">BMI <InfoIcon tip="What is BMI?" onClick={() => openInfo('bmi')} /></div>
            <div className="value">
              {bmi ? bmi : "—"}
            </div>
            {bmi ? <BmiScale bmi={bmi} /> : null}
          </div>
        </div>

        {goals && (
          <div className="auto-grid" style={{ marginTop: 10 }}>
            <div className="tile">
              <div className="label">Maintain</div>
              <div className="value">{goals.maintain} kcal/day</div>
            </div>
            <div className="tile">
              <div className="label">Cut (~15%)</div>
              <div className="value">{goals.cut15} kcal/day</div>
            </div>
            <div className="tile">
              <div className="label">Gain (~15%)</div>
              <div className="value">{goals.gain15} kcal/day</div>
            </div>
          </div>
        )}

        <p className="note">
          Note: This is an estimate. Individual needs vary due to metabolism,
          body composition, and other factors.
        </p>
      </div>

      <footer className="footer">
        <a
          href="https://en.wikipedia.org/wiki/Basal_metabolic_rate#Mifflin%E2%80%93St_Jeor_equation"
          target="_blank"
          rel="noreferrer"
        >
          Mifflin–St Jeor formula
        </a>
        {" · "}Activity multipliers: 1.2–1.9
        {" · "}
        <button
          className="button ghost"
          style={{ padding: "6px 10px", marginLeft: 6, borderRadius: 999 }}
          onClick={() => alert("Designed by Ali Tleis")}
        >
          Credits
        </button>
      </footer>

      {infoModal.open && (
        <div
          onClick={closeInfo}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            backdropFilter: "blur(4px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-title"
            style={{
              width: "min(560px, 92%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(180deg, rgba(14,22,44,.85), rgba(12,19,36,.8))",
              boxShadow: "0 20px 50px rgba(0,0,0,.45)",
              padding: 20,
              color: "inherit",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div id="info-title" style={{ fontWeight: 700, fontSize: 18 }}>{infoModal.title}</div>
              <button
                type="button"
                onClick={closeInfo}
                className="button ghost"
                style={{ padding: "6px 10px", borderRadius: 10 }}
              >
                Close
              </button>
            </div>
            <div style={{ marginTop: 10, opacity: .85, lineHeight: 1.6 }}>{infoModal.body}</div>
          </div>
        </div>
      )}
    </div>
  );
}