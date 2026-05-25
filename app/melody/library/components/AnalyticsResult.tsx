"use client";
import React from "react";
import type { SongMetadata, LibraryNoteAttempt } from "../types";
import { NOTE_DISPLAY } from "../../../training/types";

interface Props {
  song: SongMetadata;
  attempts: LibraryNoteAttempt[];
  score: number;
  unlockedSongs: string[];
  onRetry: () => void;
  onExit: () => void;
}

export default function AnalyticsResult({
  song,
  attempts,
  score,
  unlockedSongs,
  onRetry,
  onExit,
}: Props) {
  // Compute round stats
  const totalNotes = song.notes.length;
  const correctNotes = attempts.filter((a) => a.correct).length;
  
  const accuracy = totalNotes > 0 
    ? Math.round((correctNotes / totalNotes) * 100)
    : 0;

  const timingAccuracy = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.timingScore, 0) / attempts.length)
    : 0;

  const durationAccuracy = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.durationScore, 0) / attempts.length)
    : 0;

  const maxCombo = attempts.reduce((acc, curr, idx) => {
    let currentCombo = 0;
    for (let i = 0; i <= idx; i++) {
      if (attempts[i].correct) {
        currentCombo++;
      } else {
        currentCombo = 0;
      }
    }
    return Math.max(acc, currentCombo);
  }, 0);

  // Grade classification
  let grade: "S" | "A" | "B" | "C" | "D" = "D";
  let gradeColor = "var(--wrong)";
  if (accuracy >= 95 && timingAccuracy >= 90) {
    grade = "S";
    gradeColor = "#d4af37"; // gold
  } else if (accuracy >= 85) {
    grade = "A";
    gradeColor = "var(--correct)";
  } else if (accuracy >= 70) {
    grade = "B";
    gradeColor = "var(--accent)";
  } else if (accuracy >= 50) {
    grade = "C";
    gradeColor = "var(--text-sub)";
  }

  // Check if progression unlocked next pack
  const didUnlock = accuracy >= 80;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.35s ease forwards" }}>
      {/* Header Summary */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "24px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
            PERFORMANCE GRADE
          </div>
          <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
            {song.title}
          </h2>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            by {song.artist}
          </p>

          {didUnlock && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--correct)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>workspace_premium</span>
              <span>Next module unlocked (accuracy ≥ 80%)!</span>
            </div>
          )}
        </div>

        {/* Big Premium Circular Grade Icon */}
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: `3px solid ${gradeColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 24px ${gradeColor}30`,
            backgroundColor: "var(--bg-raised)",
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 44, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>
            {grade}
          </span>
        </div>
      </div>

      {/* Grid: Primary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { label: "accuracy", value: `${accuracy}%`, color: gradeColor },
          { label: "rhythm timing", value: `${timingAccuracy}%`, color: "var(--info)" },
          { label: "duration hold", value: `${durationAccuracy}%`, color: "var(--accent)" },
          { label: "max combo", value: `×${maxCombo}`, color: "var(--correct)" },
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
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed note-by-note validation breakdown table */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bg-border)", background: "var(--bg-raised)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            DETAILED RHYTHMIC VALIDATION BREAKDOWN
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--bg-border)" }}>
                {["#", "expected Note", "played Note", "status", "timing offset", "hold duration", "rhythm score"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: "var(--text-muted)",
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
              {song.notes.map((n, idx) => {
                const attempt = attempts[idx];
                const noteLabel = NOTE_DISPLAY[n.note] ?? n.note;
                const playedLabel = attempt ? (attempt.played ? (NOTE_DISPLAY[attempt.played] ?? attempt.played) : "—") : "—";
                const isCorrect = attempt?.correct ?? false;
                const isMissed = !attempt;

                // Color helpers
                let statusColor = "var(--text-muted)";
                let statusLabel = "—";
                if (!isMissed) {
                  statusColor = isCorrect ? "var(--correct)" : "var(--wrong)";
                  statusLabel = isCorrect ? "✓ PERFECT" : "✗ INCORRECT";
                } else {
                  statusColor = "var(--text-muted)";
                  statusLabel = "Ø MISSED";
                }

                const offsetLabel = attempt
                  ? (attempt.timeOffsetMs > 0 ? `+${attempt.timeOffsetMs}ms (late)` : `${attempt.timeOffsetMs}ms (early)`)
                  : "—";

                const holdLabel = attempt
                  ? (attempt.durationOffsetMs > 0 ? `+${attempt.durationOffsetMs}ms (too long)` : `${attempt.durationOffsetMs}ms (too short)`)
                  : "—";

                const scorePercent = attempt ? Math.round((attempt.timingScore + attempt.durationScore) / 2) : 0;

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--bg-border)",
                      backgroundColor: isMissed ? "transparent" : (isCorrect ? "rgba(74,222,128,0.02)" : "rgba(239,68,68,0.02)"),
                    }}
                  >
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                      {noteLabel}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: statusColor }}>
                      {playedLabel}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: statusColor }}>
                      {statusLabel}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-sub)" }}>
                      {offsetLabel}
                    </td>
                    <td style={{ padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-sub)" }}>
                      {holdLabel}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${scorePercent}%`,
                              background: scorePercent >= 80 ? "var(--correct)" : scorePercent >= 50 ? "var(--accent)" : "var(--wrong)",
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                          {scorePercent}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score earned total */}
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
          TOTAL PRACTICED SCORE
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 38, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.04em" }}>
          +{score.toLocaleString()}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={onRetry}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            padding: "12px 24px",
            background: "var(--bg-raised)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-sub)",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--text-muted)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.color = "var(--text-sub)"; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>replay</span>
          Practice Again
        </button>

        <button
          onClick={onExit}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            padding: "12px 32px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <span>Melody Library Browser</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
