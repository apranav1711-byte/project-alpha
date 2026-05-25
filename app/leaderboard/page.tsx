"use client";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";

const TOP3 = [
  { rank: "#2", name: "SonicWave",  tier: "Master IV",      accuracy: 98.2, rating: "3,104", glow: "silver", h: 300, numColor: "#c0c0c0", avatar: "SW", delay: "2s" },
  { rank: "#1", name: "AuraPitch",  tier: "Grandmaster I",  accuracy: 99.8, rating: "3,450", glow: "gold",   h: 360, numColor: "#ffd700", avatar: "AP", delay: "0s" },
  { rank: "#3", name: "RhythmK",    tier: "Master III",     accuracy: 96.5, rating: "2,980", glow: "bronze", h: 280, numColor: "#cd7f32", avatar: "RK", delay: "4s" },
] as const;

const TABLE_ROWS = [
  { rank: 4, name: "EchoBlade",    tier: "Diamond I",    acc: "94.2%", rating: "2,850", trend: "trending_up",   trendColor: "var(--correct)" },
  { rank: 5, name: "VelocityX",    tier: "Diamond II",   acc: "93.8%", rating: "2,795", trend: "trending_flat", trendColor: "var(--text-muted)" },
  { rank: 6, name: "PitchPerfect", tier: "Diamond III",  acc: "92.1%", rating: "2,710", trend: "trending_down", trendColor: "var(--wrong)" },
  { rank: 7, name: "HarmoniQ",     tier: "Platinum I",   acc: "90.5%", rating: "2,640", trend: "trending_up",   trendColor: "var(--correct)" },
  { rank: 8, name: "NoteForge",    tier: "Platinum II",  acc: "89.3%", rating: "2,580", trend: "trending_flat", trendColor: "var(--text-muted)" },
];

const GLOW: Record<string, React.CSSProperties> = {
  gold:   { boxShadow: "0 0 24px rgba(255,215,0,0.45)",   border: "2px solid rgba(255,215,0,0.6)" },
  silver: { boxShadow: "0 0 20px rgba(192,192,192,0.35)", border: "2px solid rgba(192,192,192,0.5)" },
  bronze: { boxShadow: "0 0 18px rgba(205,127,50,0.35)",  border: "2px solid rgba(205,127,50,0.5)" },
};

export default function Leaderboard() {
  return (
    <>
      <TopNav />
      <SideNav />

      <main
        className="md:ml-64"
        style={{
          paddingTop: 72,
          paddingBottom: 64,
          paddingLeft: 40,
          paddingRight: 40,
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
              global rankings
            </div>
            <h1
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(28px, 5vw, 52px)",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                marginBottom: 10,
              }}
            >
              Leaderboard
            </h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-sub)" }}>
              The elite tier of musical ear training athletes.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-muted)" }}>search</span>
              <input
                placeholder="search athletes..."
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  color: "var(--text)",
                  borderRadius: 7,
                  padding: "10px 14px 10px 36px",
                  outline: "none",
                  width: 220,
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--bg-border)")}
              />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 8, padding: 4, gap: 2 }}>
              {["Global", "Friends", "Regional"].map((t, i) => (
                <button
                  key={t}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    padding: "7px 16px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    background: i === 0 ? "var(--accent-sub)" : "transparent",
                    color: i === 0 ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: i === 0 ? 700 : 400,
                    transition: "color 0.15s, background 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Podium ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 40,
            alignItems: "flex-end",
          }}
        >
          {[TOP3[0], TOP3[1], TOP3[2]].map((p, i) => (
            <div
              key={p.rank}
              style={{
                order: i === 0 ? 1 : i === 1 ? 0 : 2,
                height: p.h,
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 12,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                position: "relative",
                animation: `subtleFloat 6s ease-in-out ${p.delay} infinite`,
              }}
            >
              {/* Crown */}
              {p.rank === "#1" && (
                <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)" }}>
                  <span className="material-symbols-outlined filled-icon" style={{ fontSize: 32, color: "#eab308" }}>crown</span>
                </div>
              )}

              {/* Avatar */}
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--bg-raised)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--accent)",
                  ...GLOW[p.glow],
                }}
              >
                {p.avatar}
                <div style={{
                  position: "absolute", bottom: -6, right: -6,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "var(--bg)",
                  border: "1px solid var(--bg-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                  color: p.numColor,
                }}>
                  {p.rank.replace("#", "")}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 44, width: "100%" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--purple)", marginBottom: 16 }}>{p.tier}</div>

                <div style={{ height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{
                    height: "100%",
                    width: `${p.accuracy}%`,
                    background: p.glow === "gold" ? "#eab308" : "var(--accent)",
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
                  <span>accuracy</span>
                  <span style={{ color: "var(--accent)" }}>{p.accuracy}%</span>
                </div>

                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: p.glow === "gold" ? "#ffd700" : "var(--text)",
                  letterSpacing: "-0.03em",
                }}>
                  {p.rating}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Rankings Table ── */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--bg-border)" }}>
                  {["rank", "athlete", "tier", "accuracy", "rating", "trend"].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 20px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: "var(--text-muted)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        textAlign: h === "rank" || h === "trend" ? "center" : "left",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(row => (
                  <TableRow key={row.rank} row={row} />
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              padding: "16px 20px",
              background: "var(--bg-raised)",
              borderTop: "1px solid var(--bg-border)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: "var(--accent)",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              load more
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Alpha</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>© 2024 Project Alpha</div>
        </footer>
      </main>
    </>
  );
}

function TableRow({ row }: { row: typeof TABLE_ROWS[number] }) {
  return (
    <tr
      style={{ borderBottom: "1px solid var(--bg-border)", cursor: "default", transition: "background 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-raised)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-muted)", textAlign: "center" }}>{row.rank}</td>
      <td style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "var(--bg-raised)", border: "1px solid var(--bg-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: "var(--accent)",
          }}>
            {row.name[0]}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{row.name}</span>
        </div>
      </td>
      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--purple)" }}>{row.tier}</td>
      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>{row.acc}</td>
      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{row.rating}</td>
      <td style={{ padding: "16px 20px", textAlign: "center" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: row.trendColor }}>{row.trend}</span>
      </td>
    </tr>
  );
}
