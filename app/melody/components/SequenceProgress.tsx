"use client";
import type { NoteAttempt } from "../types";
import { NOTE_DISPLAY } from "../../training/types";

interface Props {
  total: number;          // total notes in melody
  attempts: NoteAttempt[]; // completed attempts
  currentIndex: number;   // which note user is on (0-based)
  phase: "inputting" | "result" | "session_end" | string;
}

export default function SequenceProgress({ total, attempts, currentIndex, phase }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        const attempt = attempts[i];
        const isCurrent = i === currentIndex && phase === "inputting";
        const isDone = attempt !== undefined;

        let bg = "var(--bg-raised)";
        let border = "2px solid var(--bg-border)";
        let label = "○";
        let labelColor = "var(--text-muted)";

        if (isDone) {
          if (phase === "inputting") {
            bg = "var(--accent)";
            border = "2px solid var(--accent)";
            label = "●";
            labelColor = "#fff";
          } else {
            bg = attempt.correct ? "var(--correct)" : "var(--wrong)";
            border = `2px solid ${attempt.correct ? "var(--correct)" : "var(--wrong)"}`;
            label = attempt.correct ? "✓" : "✗";
            labelColor = "#fff";
          }
        } else if (isCurrent) {
          bg = "var(--accent-sub)";
          border = "2px solid var(--accent)";
          label = "●";
          labelColor = "var(--accent)";
        }

        const showTooltip = isDone && phase !== "inputting";

        return (
          <div
            key={i}
            title={showTooltip ? `Expected: ${NOTE_DISPLAY[attempt.expected]}${attempt.played ? ` → Played: ${NOTE_DISPLAY[attempt.played]}` : ""}` : ""}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: bg,
              border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isDone && phase !== "inputting" ? 14 : 16,
              color: labelColor,
              fontWeight: 700,
              transition: "all 0.2s ease",
              flexShrink: 0,
              transform: isCurrent ? "scale(1.15)" : "scale(1)",
              boxShadow: isCurrent ? "0 0 10px var(--accent)" : isDone && attempt.correct && phase !== "inputting" ? "0 0 8px var(--correct)" : "none",
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
