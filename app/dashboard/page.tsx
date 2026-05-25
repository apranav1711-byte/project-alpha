"use client";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import Link from "next/link";

const ACTIVITY = [
  { day: "Mon", h: 40 }, { day: "Tue", h: 65 }, { day: "Wed", h: 85, active: true },
  { day: "Thu", h: 50 }, { day: "Fri", h: 90 }, { day: "Sat", h: 30 }, { day: "Sun", h: 10 },
];

const SKILLS = [
  { label: "Pitch",     pct: 92 },
  { label: "Chords",   pct: 74 },
  { label: "Intervals", pct: 68 },
  { label: "Rhythm",   pct: 83 },
  { label: "Memory",   pct: 57 },
];

export default function Dashboard() {
  return (
    <>
      <TopNav />
      <SideNav />

      <main
        style={{
          marginLeft: 256,
          paddingTop: 56,
          minHeight: "100vh",
          background: "var(--bg)",
          padding: "72px 40px 48px",
        }}
        className="md:ml-64"
      >
        {/* ── Welcome ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.03em",
                marginBottom: 6,
              }}
            >
              Welcome back, Alex.
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-muted)" }}>
              Your pitch accuracy is in the top 2% this week.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              padding: "12px 20px",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--accent)" }}>local_fire_department</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text)" }}>14 day streak</span>
            </div>
            <div style={{ width: 1, height: 16, background: "var(--bg-border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--purple)" }}>military_tech</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text)" }}>Platinum Rank</span>
            </div>
          </div>
        </div>

        {/* ── Bento Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>

          {/* XP Progress — 8 cols */}
          <div
            style={{
              gridColumn: "span 8",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              Current Level
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 64, fontWeight: 700, color: "var(--text)", lineHeight: 1, letterSpacing: "-0.04em" }}>42</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, color: "var(--text-muted)" }}>/ 50</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>98% accuracy</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>2,450 XP to next rank</div>
              </div>
            </div>
            {/* XP bar */}
            <div style={{ height: 8, background: "var(--bg-raised)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "78%", background: "var(--accent)", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>Lvl 42</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>Lvl 43</span>
            </div>
          </div>

          {/* Quick Play — 4 cols */}
          <Link
            href="/training"
            style={{
              gridColumn: "span 4",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 12,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
              textDecoration: "none",
              transition: "border-color 0.2s, transform 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--accent-sub)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--accent)" }}>play_arrow</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Quick Play</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)", lineHeight: 1.6 }}>
              Jump into a session based on your weak points.
            </div>
          </Link>

          {/* Skill Breakdown — 5 cols */}
          <div
            style={{
              gridColumn: "span 5",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Skill Analysis
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {SKILLS.map(s => (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)" }}>{s.label}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: s.pct >= 80 ? "var(--correct)" : s.pct >= 60 ? "var(--accent)" : "var(--wrong)", fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: s.pct >= 80 ? "var(--correct)" : s.pct >= 60 ? "var(--accent)" : "var(--wrong)", borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity — 7 cols */}
          <div
            style={{
              gridColumn: "span 7",
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 12,
              padding: 28,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Weekly Activity
              </div>
              <select
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  background: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  color: "var(--text-sub)",
                  borderRadius: 5,
                  padding: "4px 8px",
                  cursor: "pointer",
                }}
              >
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
              {ACTIVITY.map((b) => (
                <div key={b.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: `${b.h}%`,
                        background: b.active ? "var(--accent)" : "var(--bg-raised)",
                        borderRadius: "4px 4px 0 0",
                        transition: "background 0.2s",
                      }}
                    />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: b.active ? "var(--accent)" : "var(--text-muted)", fontWeight: b.active ? 700 : 400 }}>
                    {b.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Alpha</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>© 2024 Project Alpha. Engineered for Performance.</div>
        </footer>
      </main>
    </>
  );
}
