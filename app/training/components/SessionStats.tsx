"use client";
import { NOTE_DISPLAY, type NoteName, type HistoryEntry } from "../types";
import Link from "next/link";

interface Props {
  score: number;
  accuracy: number;
  maxCombo: number;
  totalAttempts: number;
  correctAttempts: number;
  history: HistoryEntry[];
  onRestart: () => void;
}

const GRADES: Array<{ min: number; label: string; color: string }> = [
  { min: 95, label: "S", color: "#e2b714" },
  { min: 85, label: "A", color: "#4ade80" },
  { min: 70, label: "B", color: "#5ba4cf" },
  { min: 55, label: "C", color: "#d1d0c5" },
  { min: 0,  label: "D", color: "#ca4754" },
];

function getGrade(accuracy: number) {
  return GRADES.find(g => accuracy >= g.min) ?? GRADES[GRADES.length - 1];
}

export function SessionStats({
  score,
  accuracy,
  maxCombo,
  totalAttempts,
  correctAttempts,
  history,
  onRestart,
}: Props) {
  const grade = getGrade(accuracy);

  const noteSummary = history.reduce<Record<NoteName, { correct: number; total: number }>>(
    (acc, e) => {
      if (!acc[e.target]) acc[e.target] = { correct: 0, total: 0 };
      acc[e.target].total++;
      if (e.correct) acc[e.target].correct++;
      return acc;
    },
    {} as Record<NoteName, { correct: number; total: number }>
  );

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        animation: "mtFadeIn 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {/* ── Grade + primary stats ── */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 32 }}>
        {/* Grade letter */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: grade.color,
          }}
        >
          {grade.label}
        </div>

        {/* Primary stats column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <BigStat label="score" value={String(score)} color={grade.color} />
          <BigStat label="accuracy" value={`${accuracy}%`} color="#d1d0c5" />
        </div>
      </div>

      {/* ── Secondary stats ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <SmallStat label="max combo" value={`${maxCombo}×`} />
        <SmallStat label="notes played" value={`${correctAttempts} / ${totalAttempts}`} />
        <SmallStat label="correct" value={String(correctAttempts)} />
        <SmallStat label="incorrect" value={String(totalAttempts - correctAttempts)} />
      </div>

      {/* ── Note breakdown ── */}
      {Object.keys(noteSummary).length > 0 && (
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#646669",
              marginBottom: 10,
              letterSpacing: "0.06em",
            }}
          >
            note breakdown
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(Object.entries(noteSummary) as [NoteName, { correct: number; total: number }][]).map(
              ([note, { correct, total }]) => {
                const pct = Math.round((correct / total) * 100);
                const col = pct === 100 ? "#4ade80" : pct >= 50 ? "#d1d0c5" : "#ca4754";
                return (
                  <div
                    key={note}
                    style={{
                      background: "#2c2c2c",
                      borderRadius: 6,
                      padding: "6px 10px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                      minWidth: 48,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 15,
                        fontWeight: 700,
                        color: col,
                      }}
                    >
                      {NOTE_DISPLAY[note]}
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        color: "#646669",
                      }}
                    >
                      {correct}/{total}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: "12px",
            background: "#e2b714",
            color: "#232323",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          play again
        </button>
        <Link
          href="/leaderboard"
          style={{
            flex: 1,
            padding: "12px",
            background: "#2c2c2c",
            color: "#646669",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            transition: "color 0.15s",
            textAlign: "center",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#d1d0c5")}
          onMouseLeave={e => (e.currentTarget.style.color = "#646669")}
        >
          leaderboard
        </Link>
      </div>
    </div>
  );
}

function BigStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#646669",
          letterSpacing: "0.08em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 28,
          fontWeight: 700,
          color: color ?? "#d1d0c5",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#2c2c2c",
        borderRadius: 6,
        padding: "10px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#646669",
          marginBottom: 4,
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: "#d1d0c5",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
