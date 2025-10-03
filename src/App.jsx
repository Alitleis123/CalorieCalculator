import { useMemo, useState } from "react";

const ACTIVITY_LEVELS = [
  { value: "1.2", label: "Sedentary (little or no exercise)" },
  { value: "1.375", label: "Light (1–3 days/week)" },
  { value: "1.55", label: "Moderate (3–5 days/week)" },
  { value: "1.725", label: "Very active (6–7 days/week)" },
  { value: "1.9", label: "Extra active (hard training/physical job)" },
];

function toMetric({ unitSystem, weight, heightCm, heightFt, heightIn }) {
  if (unitSystem === "metric") {
    return {
      kg: Number(weight) || 0,
      cm: Number(heightCm) || 0,
    };
  }
  // imperial → metric
  const lbs = Number(weight) || 0;
  const ft = Number(heightFt) || 0;
  const inch = Number(heightIn) || 0;
  const totalInches = ft * 12 + inch;
  const kg = lbs * 0.45359237;
  const cm = totalInches * 2.54;
  return { kg, cm };
}

function mifflinStJeorBMR({ sex, kg, cm, age }) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export default function App() {
  const [unitSystem, setUnitSystem] = useState("metric"); // "metric" | "imperial"
  const [sex, setSex] = useState("male"); // "male" | "female"
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [activity, setActivity] = useState("1.2");

  const { kg, cm } = useMemo(
    () =>
      toMetric({
        unitSystem,
        weight,
        heightCm,
        heightFt,
        heightIn,
      }),
    [unitSystem, weight, heightCm, heightFt, heightIn]
  );

  const bmr = useMemo(() => {
    const a = Number(age) || 0;
    if (kg <= 0 || cm <= 0 || a <= 0) return 0;
    return Math.max(0, Math.round(mifflinStJeorBMR({ sex, kg, cm, age: a })));
  }, [sex, kg, cm, age]);

  const tdee = useMemo(() => {
    if (!bmr) return 0;
    const mult = Number(activity);
    return Math.round(bmr * mult);
  }, [bmr, activity]);

  const maintenance = tdee; // TDEE ≈ maintenance calories

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Calorie Maintenance Calculator</h1>
        <p style={styles.muted}>
          Uses the Mifflin–St Jeor equation to estimate BMR and TDEE.
        </p>

        {/* Units */}
        <div style={styles.row}>
          <label style={styles.label}>Units</label>
          <div>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="units"
                value="metric"
                checked={unitSystem === "metric"}
                onChange={(e) => setUnitSystem(e.target.value)}
              />
              Metric (kg, cm)
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="units"
                value="imperial"
                checked={unitSystem === "imperial"}
                onChange={(e) => setUnitSystem(e.target.value)}
              />
              Imperial (lb, ft/in)
            </label>
          </div>
        </div>

        {/* Sex & Age */}
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              style={styles.input}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Age (years)</label>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 28"
              style={styles.input}
            />
          </div>
        </div>

        {/* Weight */}
        <div>
          <label style={styles.label}>
            Weight {unitSystem === "metric" ? "(kg)" : "(lb)"}
          </label>
          <input
            type="number"
            min="0"
            step="any"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unitSystem === "metric" ? "70" : "154"}
            style={styles.input}
          />
        </div>

        {/* Height */}
        {unitSystem === "metric" ? (
          <div>
            <label style={styles.label}>Height (cm)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="175"
              style={styles.input}
            />
          </div>
        ) : (
          <div style={styles.grid2}>
            <div>
              <label style={styles.label}>Height (ft)</label>
              <input
                type="number"
                min="0"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                placeholder="5"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Height (in)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                placeholder="9"
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* Activity */}
        <div>
          <label style={styles.label}>Activity level</label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            style={styles.input}
          >
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        <div style={styles.results}>
          <ResultTile label="BMR" value={bmr ? `${bmr} kcal/day` : "—"} />
          <ResultTile
            label="Maintenance (TDEE)"
            value={tdee ? `${maintenance} kcal/day` : "—"}
          />
        </div>

        <p style={styles.note}>
          Note: This is an estimate. Individual needs vary due to metabolism,
          body composition, and other factors.
        </p>
      </div>

      <footer style={styles.footer}>
        <a
          href="https://en.wikipedia.org/wiki/Basal_metabolic_rate#Mifflin%E2%80%93St_Jeor_equation"
          target="_blank"
          rel="noreferrer"
          style={{ color: "inherit" }}
        >
          Mifflin–St Jeor formula
        </a>
        {" · "}
        Activity multipliers: 1.2–1.9
      </footer>
    </div>
  );
}

function ResultTile({ label, value }) {
  return (
    <div style={styles.tile}>
      <div style={styles.tileLabel}>{label}</div>
      <div style={styles.tileValue}>{value}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100svh",
    display: "grid",
    placeItems: "center",
    background: "#0b1220",
    color: "#e8ecf3",
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(6px)",
  },
  h1: { margin: "0 0 6px 0", fontSize: 28, letterSpacing: 0.2 },
  muted: { margin: "0 0 18px 0", opacity: 0.8, fontSize: 14 },
  label: { display: "block", fontSize: 14, marginBottom: 6, opacity: 0.9 },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "inherit",
    outline: "none",
  },
  radioLabel: { marginRight: 16, fontSize: 14 },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  results: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },
  tile: {
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    padding: 16,
  },
  tileLabel: { fontSize: 13, opacity: 0.8 },
  tileValue: { fontSize: 22, marginTop: 6 },
  note: { marginTop: 14, fontSize: 12, opacity: 0.75 },
  footer: { marginTop: 16, opacity: 0.6, fontSize: 12, textAlign: "center" },
};