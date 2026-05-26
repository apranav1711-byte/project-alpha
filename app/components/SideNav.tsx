"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, THEMES } from "./ThemeProvider";
import { useUserProfile } from "../profile/utils/userState";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/training", icon: "piano", label: "Training" },
  { href: "/training/chords", icon: "graphic_eq", label: "Chords Trainer" },
  { href: "/melody", icon: "music_note", label: "Melody Mode" },
  { href: "/leaderboard", icon: "social_leaderboard", label: "Leaderboard" },
  { href: "/melody/library", icon: "library_music", label: "Library" },
];

export default function SideNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const profile = useUserProfile();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      document.documentElement.setAttribute("data-sidebar-expanded", "true");
    } else {
      document.documentElement.removeAttribute("data-sidebar-expanded");
    }
    return () => {
      document.documentElement.removeAttribute("data-sidebar-expanded");
    };
  }, [isHovered]);

  const isColorAvatar = profile.avatarUrl.startsWith("avatar_color:");
  const isPhotoUrl = profile.avatarUrl && (profile.avatarUrl.startsWith("http://") || profile.avatarUrl.startsWith("https://") || profile.avatarUrl.startsWith("/"));
  const avatarBg = isPhotoUrl ? "transparent" : (isColorAvatar ? profile.avatarUrl.split(":")[1] : "var(--accent)");
  const initials = profile.username.substring(0, 2).toUpperCase();

  return (
    <nav
      className="hidden md:flex flex-col fixed left-0 top-[56px] h-[calc(100vh-56px)] z-40 transition-all duration-300 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? 256 : 68,
        padding: isHovered ? "16px 20px 20px" : "16px 14px 20px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-border)",
        boxShadow: isHovered ? "8px 0 32px rgba(0,0,0,0.3)" : "none",
        overflow: "hidden",
      }}
    >

      {/* ── Start Practice CTA ── */}
      <Link
        href="/training"
        title={!isHovered ? "Start Practice" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isHovered ? 8 : 0,
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
          width: "100%",
          height: 40,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>play_arrow</span>
        {isHovered && <span style={{ animation: "mtFadeIn 0.2s ease", whiteSpace: "nowrap" }}>start practice</span>}
      </Link>

      {/* ── Nav Links ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isHovered ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isHovered ? "flex-start" : "center",
                gap: isHovered ? 10 : 0,
                padding: isHovered ? "10px 12px" : "10px 0",
                borderRadius: 7,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                color: active ? "var(--accent)" : "var(--text-sub)",
                background: active ? "var(--accent-sub)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s, background 0.15s",
                width: "100%",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--bg-raised)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.background = "transparent"; } }}
            >
              <span
                className={`material-symbols-outlined ${active ? "filled-icon" : ""}`}
                style={{ fontSize: 18, color: active ? "var(--accent)" : "var(--text-muted)", flexShrink: 0 }}
              >
                {item.icon}
              </span>
              {isHovered && <span style={{ animation: "mtFadeIn 0.2s ease", whiteSpace: "nowrap" }}>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* ── Theme Switcher ── */}
      {isHovered && (
        <div style={{ borderTop: "1px solid var(--bg-border)", paddingTop: 16, marginBottom: 12, width: "100%", animation: "mtFadeIn 0.25s ease" }}>
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
      )}

      {/* ── User ── */}
      <Link
        href="/profile"
        title={!isHovered ? (profile.provider !== "none" ? profile.username : "Log In / Sign Up") : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isHovered ? "flex-start" : "center",
          gap: isHovered ? 10 : 0,
          padding: isHovered ? "10px 8px" : "10px 0",
          borderTop: "1px solid var(--bg-border)",
          textDecoration: "none",
          transition: "background 0.15s, transform 0.15s",
          borderRadius: 8,
          cursor: "pointer",
          width: "100%",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: avatarBg,
            border: "1px solid var(--bg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            color: isColorAvatar ? "#0f1115" : "var(--bg)",
            overflow: "hidden",
          }}
        >
          {profile.provider !== "none" ? (
            isPhotoUrl ? (
              <img src={profile.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )
          ) : (
            isPhotoUrl ? (
              <img src={profile.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person</span>
            )
          )}
        </div>
        {isHovered && (
          <div style={{ animation: "mtFadeIn 0.2s ease" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
              {profile.provider !== "none" ? profile.username : "Log In / Sign Up"}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--accent)" }}>
              {profile.provider !== "none" ? `Lvl ${profile.level}` : "Guest Mode"}
            </div>
          </div>
        )}
      </Link>
    </nav>
  );
}
