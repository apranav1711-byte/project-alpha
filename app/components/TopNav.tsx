"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, THEMES } from "./ThemeProvider";
import { useUserProfile } from "../profile/utils/userState";

const navLinks = [
  { href: "/dashboard", label: "dashboard" },
  { href: "/training", label: "training" },
  { href: "/melody", label: "melody" },
  { href: "/melody/library", label: "library" },
  { href: "/leaderboard", label: "leaderboard" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const profile = useUserProfile();

  const isColorAvatar = profile.avatarUrl.startsWith("avatar_color:");
  const isPhotoUrl = profile.avatarUrl && (profile.avatarUrl.startsWith("http://") || profile.avatarUrl.startsWith("https://") || profile.avatarUrl.startsWith("/"));
  const avatarBg = isPhotoUrl ? "transparent" : (isColorAvatar ? profile.avatarUrl.split(":")[1] : "var(--accent)");
  const initials = profile.username.substring(0, 2).toUpperCase();

  return (
    <nav
      className="top-nav-layout fixed top-0 z-50 flex justify-between items-center px-6 h-14"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--bg-border)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 16,
          fontWeight: 700,
          color: "var(--accent)",
          textDecoration: "none",
          letterSpacing: "-0.02em",
        }}
      >
        Alpha
      </Link>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
        {navLinks.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--accent)" : "var(--text-sub)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: 6,
                background: active ? "var(--accent-sub)" : "transparent",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--text)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "var(--text-sub)"; }}
            >
              {l.label}
            </Link>
          );
        })}
      </div>

      {/* Right: theme dots + icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Theme switcher */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTheme(t.id)}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: t.accent,
                border: theme === t.id ? "2px solid var(--text)" : "2px solid transparent",
                cursor: "pointer",
                transition: "transform 0.15s",
                outline: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.3)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
        </div>

        {/* Icons */}
        {[
          { icon: "local_fire_department", title: "Streak" },
          { icon: "military_tech", title: "Rank" },
        ].map(({ icon, title }) => (
          <button
            key={icon}
            title={title}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-sub)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-sub)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
          </button>
        ))}

        {/* Avatar */}
        <Link
          href="/profile"
          title={profile.provider !== "none" ? profile.username : "Log In / Sign Up"}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: avatarBg,
            border: "1px solid var(--bg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: isColorAvatar ? "#0f1115" : "var(--bg)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          {profile.provider !== "none" ? (
            isPhotoUrl ? (
              <img src={profile.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              initials
            )
          ) : (
            isPhotoUrl ? (
              <img src={profile.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            )
          )}
        </Link>
      </div>
    </nav>
  );
}
