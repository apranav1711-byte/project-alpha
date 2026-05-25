"use client";

interface Props {
  score: number;
  lives: number;
  maxLives: number;
  combo: number;
  multiplier: number;
  melodyName: string;
  melodyIndex: number;
  totalMelodies: number;
}

export default function MelodyHUD({
  score, lives, maxLives, combo, multiplier,
  melodyName, melodyIndex, totalMelodies,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        background: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        borderRadius: 10,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Lives */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: maxLives }).map((_, i) => (
            <span
              key={i}
              className="material-symbols-outlined filled-icon"
              style={{
                fontSize: 22,
                color: i < lives ? "var(--wrong)" : "var(--bg-raised)",
                filter: i < lives ? "drop-shadow(0 0 6px rgba(202,71,84,0.6))" : "none",
                transition: "color 0.2s, filter 0.2s",
              }}
            >
              favorite
            </span>
          ))}
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
          {lives}/{maxLives}
        </span>
      </div>

      {/* Melody info */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
          {melodyName}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
          {melodyIndex + 1} / {totalMelodies}
        </div>
      </div>

      {/* Score + Combo + Multiplier */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {combo > 0 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>combo</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
              ×{combo}
            </div>
          </div>
        )}
        {multiplier > 1 && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--accent-sub)",
              color: "var(--accent)",
            }}
          >
            {multiplier}×
          </div>
        )}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>score</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em" }}>
            {score.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
