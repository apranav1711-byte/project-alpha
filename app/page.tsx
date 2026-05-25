"use client";
import TopNav from "./components/TopNav";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <TopNav />
      <main style={{ paddingTop: 56, minHeight: "100vh", background: "var(--bg)" }}>

        {/* ── Hero ── */}
        <section
          style={{
            minHeight: "calc(100vh - 56px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px 24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Soft glow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 50% at 50% 40%, var(--accent-sub), transparent)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "var(--text-muted)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              piano ear training
            </div>

            <h1
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "clamp(36px, 7vw, 72px)",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
                marginBottom: 20,
              }}
            >
              Train Your{" "}
              <span style={{ color: "var(--accent)" }}>Musical Ear.</span>
            </h1>

            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                color: "var(--text-sub)",
                lineHeight: 1.75,
                maxWidth: 520,
                margin: "0 auto 40px",
              }}
            >
              Precision ear training for the modern musician. Master perfect pitch,
              intervals, and note recognition in a distraction-free environment.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/training"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "14px 32px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  borderRadius: 7,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                start training
              </Link>
              <Link
                href="/leaderboard"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "14px 32px",
                  background: "var(--bg-raised)",
                  color: "var(--text-sub)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 7,
                  textDecoration: "none",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
              >
                leaderboard
              </Link>
            </div>
          </div>

          {/* Decorative piano keys */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              display: "flex",
              alignItems: "flex-end",
              opacity: 0.08,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: "100%",
                  background: "var(--text)",
                  borderLeft: i > 0 ? "1px solid var(--bg)" : "none",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            ))}
          </div>
        </section>

        {/* ── Feature Grid ── */}
        <section style={{ padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            features
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              {
                icon: "bolt",
                title: "Lightning Fast",
                desc: "Instantaneous audio feedback loop. Zero latency between input and evaluation.",
              },
              {
                icon: "graphic_eq",
                title: "Real Piano Sound",
                desc: "Salamander Grand Piano samples. Authentic sound for accurate ear training.",
              },
              {
                icon: "social_leaderboard",
                title: "Competitive Rankings",
                desc: "Rank against musicians globally. Earn XP, climb tiers, and dominate challenges.",
              },
              {
                icon: "tune",
                title: "Fully Customizable",
                desc: "Choose naturals, sharps, flats. Pick session length and training mode.",
              },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 10,
                  padding: "28px 24px",
                  transition: "border-color 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "var(--accent-sub)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--accent)" }}>
                    {f.icon}
                  </span>
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                  {f.title}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)", lineHeight: 1.7 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            padding: "32px 24px",
            borderTop: "1px solid var(--bg-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Alpha</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
            © 2024 Project Alpha. Engineered for Performance.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Terms", "Privacy", "Discord", "Support"].map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {l}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </>
  );
}
