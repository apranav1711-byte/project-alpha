"use client";
import React from "react";
import type { UserProfile, AggregatedStats } from "../utils/userState";

interface Props {
  profile: UserProfile;
  stats: AggregatedStats;
}

export default function ProfileStats({ profile, stats }: Props) {
  // Determine avatar background color or initials
  const isColorAvatar = profile.avatarUrl.startsWith("avatar_color:");
  const isPhotoUrl = profile.avatarUrl && (profile.avatarUrl.startsWith("http://") || profile.avatarUrl.startsWith("https://") || profile.avatarUrl.startsWith("/"));
  const avatarBg = isPhotoUrl ? "transparent" : (isColorAvatar ? profile.avatarUrl.split(":")[1] : "var(--accent)");
  const initials = profile.username.substring(0, 2).toUpperCase();

  // XP calculations for Level Up
  const xpNeeded = profile.level * 1000;
  const xpPercent = Math.min(100, Math.round((profile.xp / xpNeeded) * 100));

  // Determine provider icon
  const getProviderDetails = () => {
    switch (profile.provider) {
      case "github":
        return { name: "GitHub", icon: "terminal", color: "#24292e" };
      case "google":
        return { name: "Google", icon: "account_circle", color: "#4285f4" };
      case "guest":
        return { name: "Guest Mode", icon: "face", color: "var(--accent)" };
      default:
        return { name: "None", icon: "person", color: "var(--text-muted)" };
    }
  };

  const provider = getProviderDetails();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
        marginBottom: 32,
        animation: "fadeInUp 0.35s ease forwards",
      }}
    >
      {/* ── User Overview & XP Card ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* User Card Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar circle */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: avatarBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: isColorAvatar ? "#0f1115" : "var(--bg)",
              border: "2px solid var(--bg-border)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {isPhotoUrl ? (
              <img src={profile.avatarUrl} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 4,
              }}
            >
              {profile.username}
            </h3>
            {/* Provider Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: "var(--text-muted)",
                background: "var(--bg-raised)",
                padding: "3px 8px",
                borderRadius: 4,
                border: "1px solid var(--bg-border)",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12, color: provider.color }}>
                {provider.icon}
              </span>
              <span>{provider.name}</span>
            </div>
          </div>
        </div>

        {/* Level & XP Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--text)", fontWeight: 700 }}>LEVEL {profile.level}</span>
            <span style={{ color: "var(--text-muted)" }}>
              {profile.xp} / {xpNeeded} XP
            </span>
          </div>

          {/* Progress bar tracker */}
          <div
            style={{
              width: "100%",
              height: 8,
              background: "var(--bg-raised)",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid var(--bg-border)",
            }}
          >
            <div
              style={{
                width: `${xpPercent}%`,
                height: "100%",
                background: "var(--accent)",
                borderRadius: 4,
                transition: "width 0.5s ease-out",
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Stats Grid Card ── */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "24px 28px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          alignItems: "center",
        }}
      >
        {[
          { label: "TIME PRACTICED", value: `${stats.timePracticedMin}m`, color: "#5ba4cf" },
          { label: "AVG ACCURACY", value: `${stats.avgAccuracy}%`, color: "var(--accent)" },
          { label: "COMPLETED", value: `${stats.totalSessions} tests`, color: "#34d399" },
          { label: "NOTES PLAYED", value: stats.totalNotesPlayed.toLocaleString(), color: "var(--text-sub)" },
          { label: "MAX COMBO", value: `${stats.maxCombo} notes`, color: "#ff7a50" },
          { label: "MELODY PACKS", value: `${stats.unlockedPacksCount} packs`, color: "#a855f7" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                fontWeight: 700,
                color: item.color,
                letterSpacing: "-0.02em",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
