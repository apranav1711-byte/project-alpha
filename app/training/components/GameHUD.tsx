"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  combo: number;
  accuracy: number;
  timeLeft: number;
  totalDuration: number;
  totalAttempts: number;
}

export function GameHUD({
  score,
  combo,
  accuracy,
  timeLeft,
  totalDuration,
  totalAttempts,
}: Props) {
  const pct = Math.max(0, (timeLeft / totalDuration) * 100);
  const timerColor =
    timeLeft > 20 ? "#4cd7f6" : timeLeft > 10 ? "#f59e0b" : "#ff6b6b";
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Track combo changes for pop animation
  const prevComboRef = useRef(combo);
  const [comboPop, setComboPop] = useState(false);
  useEffect(() => {
    if (combo > prevComboRef.current) {
      setComboPop(true);
      const t = setTimeout(() => setComboPop(false), 350);
      prevComboRef.current = combo;
      return () => clearTimeout(t);
    }
    prevComboRef.current = combo;
  }, [combo]);

  const comboColor =
    combo >= 10
      ? "#ffd700"
      : combo >= 5
      ? "#ddb7ff"
      : combo >= 3
      ? "#b8c3ff"
      : "#e2e1ef";

  const comboGlow =
    combo >= 10
      ? "0 0 32px rgba(255,215,0,0.55)"
      : combo >= 5
      ? "0 0 28px rgba(221,183,255,0.5)"
      : combo >= 3
      ? "0 0 20px rgba(184,195,255,0.4)"
      : "none";

  return (
    <div className="w-full max-w-4xl flex flex-col gap-3">
      {/* ── Timer bar ── */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ background: "#1d1f29", height: 5 }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(to right, ${timerColor}, ${timerColor}aa)`,
            transition: "width 1s linear",
            boxShadow: `0 0 8px ${timerColor}88`,
            borderRadius: 4,
          }}
        />
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Score */}
        <Stat label="SCORE" value={score.toLocaleString()} color="#b8c3ff" />

        {/* Combo — center */}
        <div className="flex flex-col items-center">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#8e90a2",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Combo
          </span>
          <div
            key={`combo-${combo}`}
            style={{
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              fontFamily: "var(--font-geist-sans)",
              color: comboColor,
              textShadow: comboGlow,
              transition: "color 0.3s, text-shadow 0.3s",
              animation: comboPop ? "correctPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
            }}
          >
            {combo}
            <span style={{ fontSize: 22, color: "#4cd7f6", opacity: 0.8 }}>×</span>
          </div>
          {combo >= 5 && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: combo >= 10 ? "#ffd700" : "#ddb7ff",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.85,
              }}
            >
              {combo >= 10 ? "🔥 ON FIRE" : "HOT STREAK"}
            </span>
          )}
        </div>

        {/* Right stats */}
        <div className="flex flex-col gap-1 items-end">
          <Stat label="ACCURACY" value={`${accuracy}%`} color="#4cd7f6" right />
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24,
              fontWeight: 700,
              color: timerColor,
              textShadow: timeLeft <= 10 ? `0 0 16px ${timerColor}` : "none",
              transition: "color 0.5s, text-shadow 0.5s",
              animation: timeLeft <= 10 ? "timerPulse 0.8s ease infinite" : "none",
            }}
          >
            {timeStr}
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#434656",
            }}
          >
            {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  right,
}: {
  label: string;
  value: string;
  color: string;
  right?: boolean;
}) {
  return (
    <div
      className="flex flex-col"
      style={{ alignItems: right ? "flex-end" : "flex-start" }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#8e90a2",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: 28,
          fontWeight: 800,
          color,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
