"use client";
import type { RoundResult } from "../types";
import { NOTE_DISPLAY } from "../../training/types";

interface Props {
  result: RoundResult;
  onReplay: () => void;
  onNext: () => void;
  isLast: boolean;
}

export default function ResultView({ result, onReplay, onNext, isLast }: Props) {
  const { melody, attempts, score, noteAccuracy, timingAccuracy, maxCombo, livesLost, perfect } = result;

  const gradeColor = noteAccuracy >= 90 ? "var(--correct)" : noteAccuracy >= 70 ? "var(--accent)" : "var(--wrong)";
  const grade =
    noteAccuracy >= 95 ? "S" :
    noteAccuracy >= 85 ? "A" :
    noteAccuracy >= 70 ? "B" :
    noteAccuracy >= 55 ? "C" : "D";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.35s ease forwards" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
            ROUND RESULT
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
            {melody.name}
          </div>
          {perfect && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--correct)", marginTop: 4 }}>
              ✦ perfect round
            </div>
          )}
        </div>

        {/* Grade */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `3px solid ${gradeColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 20px ${gradeColor}40`,
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 40, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>
            {grade}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "note accuracy",   value: `${noteAccuracy}%`,   color: gradeColor },
          { label: "timing accuracy", value: `${timingAccuracy}%`, color: "var(--info)" },
          { label: "max combo",       value: `×${maxCombo}`,       color: "var(--accent)" },
          { label: "lives lost",      value: String(livesLost),    color: livesLost > 0 ? "var(--wrong)" : "var(--correct)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 10,
              padding: "16px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Per-note breakdown */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bg-border)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            NOTE BREAKDOWN
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-raised)" }}>
                {["#", "expected", "played", "result", "timing"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "var(--text-muted)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textAlign: "left",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr
                  key={a.index}
                  style={{ borderBottom: "1px solid var(--bg-border)" }}
                >
                  <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>
                    {a.index + 1}
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                    {NOTE_DISPLAY[a.expected]}
                  </td>
                  <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: a.correct ? "var(--correct)" : "var(--wrong)", fontWeight: 700 }}>
                    {a.played ? NOTE_DISPLAY[a.played] : "—"}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: a.correct ? "var(--correct)" : "var(--wrong)" }}>
                      {a.correct ? "✓" : "✗"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${a.timingScore}%`,
                            background: a.timingScore >= 70 ? "var(--correct)" : a.timingScore >= 40 ? "var(--accent)" : "var(--wrong)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                        {a.timingScore}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score earned */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
          round score
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.04em" }}>
          +{score.toLocaleString()}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={onReplay}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "12px 24px",
            background: "var(--bg-raised)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-sub)",
            borderRadius: 7,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>replay</span>
          replay
        </button>

        <button
          onClick={onNext}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            padding: "12px 32px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {isLast ? "finish session" : "next melody"}
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
