"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, THEMES } from "./ThemeProvider";

const navItems = [
  { href: "/dashboard",   icon: "dashboard",         label: "Dashboard" },
  { href: "/training",    icon: "piano",             label: "Training" },
  { href: "/melody",      icon: "music_note",        label: "Melody Mode" },
  { href: "/leaderboard", icon: "social_leaderboard", label: "Leaderboard" },
  { href: "/melody/library", icon: "library_music",     label: "Library" },
];

export default function SideNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 z-40 p-5"
      style={{
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
      }}
    >
      {/* ── Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, marginTop: 6 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--bg)", fontSize: 20 }}>
            graphic_eq
          </span>
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            Project Alpha
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
            ear training
          </div>
        </div>
      </div>

      {/* ── Start Practice CTA ── */}
      <Link
        href="/training"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "11px 0",
          background: "var(--accent)",
          color: "var(--bg)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          borderRadius: 7,
          textDecoration: "none",
          marginBottom: 20,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>play_arrow</span>
        start practice
      </Link>

      {/* ── Nav Links ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 7,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--accent)" : "var(--text-sub)",
                background: active ? "var(--accent-sub)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-raised)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <span
                className={`material-symbols-outlined ${active ? "filled-icon" : ""}`}
                style={{ fontSize: 18, color: active ? "var(--accent)" : "var(--text-muted)" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* ── Theme Switcher ── */}
      <div style={{ borderTop: "1px solid var(--bg-border)", paddingTop: 16, marginBottom: 12 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.08em" }}>
          THEME
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTheme(t.id)}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: t.accent,
                border: theme === t.id ? "2px solid var(--text)" : "2px solid transparent",
                cursor: "pointer",
                transition: "transform 0.15s, border-color 0.15s",
                outline: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.25)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
          {THEMES.find(t => t.id === theme)?.label}
        </div>
      </div>

      {/* ── User ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 8px",
          borderTop: "1px solid var(--bg-border)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--bg-raised)",
            border: "1px solid var(--bg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--accent)" }}>person</span>
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text)" }}>Alex Virtuoso</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--accent)" }}>Lvl 42</div>
        </div>
      </div>
    </nav>
  );
}
