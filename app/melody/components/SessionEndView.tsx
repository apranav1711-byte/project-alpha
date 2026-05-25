"use client";
import type { RoundResult, MelodyPack } from "../types";
import { MELODY_PACKS } from "../data/packs";
import Link from "next/link";

interface Props {
  pack: MelodyPack;
  roundResults: RoundResult[];
  totalScore: number;
  sessionAccuracy: number;
  sessionTimingAccuracy: number;
  maxCombo: number;
  newlyUnlocked: string | null;
  onPlayAgain: () => void;
}

export default function SessionEndView({
  pack, roundResults, totalScore, sessionAccuracy,
  sessionTimingAccuracy, maxCombo, newlyUnlocked, onPlayAgain,
}: Props) {
  const unlockedPack = newlyUnlocked ? MELODY_PACKS.find((p) => p.id === newlyUnlocked) : null;

  const grade =
    sessionAccuracy >= 95 ? "S" :
    sessionAccuracy >= 85 ? "A" :
    sessionAccuracy >= 70 ? "B" :
    sessionAccuracy >= 55 ? "C" : "D";

  const gradeColor =
    sessionAccuracy >= 85 ? "var(--correct)" :
    sessionAccuracy >= 70 ? "var(--accent)" : "var(--wrong)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeInUp 0.4s ease forwards" }}>
      {/* Unlock banner */}
      {unlockedPack && (
        <div
          style={{
            background: "var(--accent-sub)",
            border: "1px solid var(--accent)",
            borderRadius: 10,
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            animation: "correctPop 0.5s ease forwards",
          }}
        >
          <span className="material-symbols-outlined filled-icon" style={{ fontSize: 28, color: "var(--accent)" }}>lock_open</span>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
              new pack unlocked!
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)", marginTop: 2 }}>
              {unlockedPack.name} — {unlockedPack.description}
            </div>
          </div>
        </div>
      )}

      {/* Session header */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 6 }}>
            SESSION COMPLETE
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
            {pack.name}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)" }}>
            {roundResults.length} melodies · difficulty {pack.difficulty}
          </div>
        </div>

        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: `3px solid ${gradeColor}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 24px ${gradeColor}40`,
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 44, fontWeight: 700, color: gradeColor, lineHeight: 1 }}>
            {grade}
          </span>
        </div>
      </div>

      {/* Overall stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "total score",     value: totalScore.toLocaleString(), color: "var(--accent)" },
          { label: "note accuracy",   value: `${sessionAccuracy}%`,       color: gradeColor },
          { label: "timing accuracy", value: `${sessionTimingAccuracy}%`, color: "var(--info)" },
          { label: "max combo",       value: `×${maxCombo}`,              color: "var(--purple)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 10,
              padding: "20px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 26, fontWeight: 700, color: s.color, letterSpacing: "-0.03em" }}>
              {s.value}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.06em" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Per-round summary */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--bg-border)" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
            ROUND SUMMARY
          </span>
        </div>
        {roundResults.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: i < roundResults.length - 1 ? "1px solid var(--bg-border)" : "none",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", width: 20 }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                {r.melody.name}
              </span>
              {r.perfect && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--correct)", background: "rgba(74,222,128,0.1)", border: "1px solid var(--correct)", borderRadius: 4, padding: "2px 6px" }}>
                  perfect
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: r.noteAccuracy >= 80 ? "var(--correct)" : "var(--wrong)", fontWeight: 700 }}>
                {r.noteAccuracy}%
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--accent)" }}>
                +{r.score.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={onPlayAgain}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            fontWeight: 700,
            padding: "13px 32px",
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
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>replay</span>
          play again
        </button>

        <Link
          href="/dashboard"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            padding: "13px 24px",
            background: "var(--bg-raised)",
            border: "1px solid var(--bg-border)",
            color: "var(--text-sub)",
            borderRadius: 7,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-sub)")}
        >
          dashboard
        </Link>
      </div>
    </div>
  );
}
