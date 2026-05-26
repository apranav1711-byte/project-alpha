"use client";
import React from "react";
import type { UserProfile, AggregatedStats } from "../utils/userState";

interface Props {
  profile: UserProfile;
  stats: AggregatedStats;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progressText: string;
  progressPercent: number;
}

export default function ProfileBadges({ profile, stats }: Props) {
  // ── Compute unlocking conditions & progress ──

  const badgesList: Badge[] = [
    {
      id: "combo_master",
      name: "Combo Master",
      description: "Reach a peak streak of 25 consecutive notes",
      icon: "bolt",
      color: "#ffaa00", // gold
      unlocked: stats.maxCombo >= 25,
      progressText: `${stats.maxCombo} / 25 notes`,
      progressPercent: Math.min(100, Math.round((stats.maxCombo / 25) * 100)),
    },
    {
      id: "ear_virtuoso",
      name: "Ear Virtuoso",
      description: "Train consistently and scale up to Level 5",
      icon: "military_tech",
      color: "#a855f7", // purple
      unlocked: profile.level >= 5,
      progressText: `Level ${profile.level} / 5`,
      progressPercent: Math.min(100, Math.round((profile.level / 5) * 100)),
    },
    {
      id: "gold_ear",
      name: "Gold Ear",
      description: "Maintain a daily average accuracy of 95% (min. 5 tests)",
      icon: "emoji_events",
      color: "#f43f5e", // rose/gold
      unlocked: stats.avgAccuracy >= 95 && stats.totalSessions >= 5,
      progressText: `${stats.avgAccuracy}% accuracy (with ${stats.totalSessions}/5 tests)`,
      progressPercent: stats.totalSessions >= 5
        ? Math.min(100, Math.round((stats.avgAccuracy / 95) * 100))
        : Math.round((stats.totalSessions / 5) * 100),
    },
    {
      id: "volume_monster",
      name: "Volume Monster",
      description: "Identify and play 1,000 notes in training/lessons",
      icon: "graphic_eq",
      color: "#38bdf8", // cyan
      unlocked: stats.totalNotesPlayed >= 1000,
      progressText: `${stats.totalNotesPlayed.toLocaleString()} / 1,000 notes`,
      progressPercent: Math.min(100, Math.round((stats.totalNotesPlayed / 1000) * 100)),
    },
    {
      id: "melody_maestro",
      name: "Repertoire Explorer",
      description: "Pass beginner lessons to unlock 3 Melody Library packs",
      icon: "library_music",
      color: "#34d399", // emerald
      unlocked: stats.unlockedPacksCount >= 3,
      progressText: `${stats.unlockedPacksCount} / 3 packs`,
      progressPercent: Math.min(100, Math.round((stats.unlockedPacksCount / 3) * 100)),
    },
    {
      id: "century_club",
      name: "Century Club",
      description: "Log a lifetime total of 10 fully-completed sessions",
      icon: "verified_user",
      color: "#ec4899", // pink
      unlocked: stats.totalSessions >= 10,
      progressText: `${stats.totalSessions} / 10 sessions`,
      progressPercent: Math.min(100, Math.round((stats.totalSessions / 10) * 100)),
    },
  ];

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 32,
        animation: "fadeInUp 0.35s ease forwards 0.25s",
        opacity: 0,
      }}
    >
      {/* Grid Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--accent)", fontSize: 20 }}>
            stars
          </span>
          <h4
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Digital Accomplishments & Badges
          </h4>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--text-muted)",
          }}
        >
          {badgesList.filter((b) => b.unlocked).length} / {badgesList.length} Unlocked
        </div>
      </div>

      {/* Badges Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {badgesList.map((badge) => (
          <div
            key={badge.id}
            style={{
              background: "var(--bg-raised)",
              border: badge.unlocked ? `1px solid ${badge.color}50` : "1px solid var(--bg-border)",
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: badge.unlocked
                ? `0 4px 20px ${badge.color}12`
                : "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              if (badge.unlocked) {
                e.currentTarget.style.boxShadow = `0 6px 24px ${badge.color}22`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = badge.unlocked
                ? `0 4px 20px ${badge.color}12`
                : "none";
            }}
          >
            {/* Soft Glow Radial under Unlocked Badge */}
            {badge.unlocked && (
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: badge.color,
                  filter: "blur(28px)",
                  opacity: 0.35,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Badge Icon & Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Badge Icon Circle */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: badge.unlocked ? `${badge.color}18` : "rgba(255,255,255,0.03)",
                  border: badge.unlocked ? `1.5px solid ${badge.color}` : "1.5px solid var(--bg-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: badge.unlocked ? `0 0 10px ${badge.color}33` : "none",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color: badge.unlocked ? badge.color : "var(--text-muted)",
                    fontVariationSettings: badge.unlocked ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {badge.unlocked ? badge.icon : "lock"}
                </span>
              </div>

              <div>
                <h5
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: badge.unlocked ? "var(--text)" : "var(--text-sub)",
                    marginBottom: 2,
                  }}
                >
                  {badge.name}
                </h5>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: "var(--text-muted)",
                    lineHeight: 1.35,
                  }}
                >
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Progress Bar & Tracker */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8.5,
                  color: badge.unlocked ? badge.color : "var(--text-muted)",
                  fontWeight: badge.unlocked ? 700 : 400,
                }}
              >
                <span>{badge.unlocked ? "UNLOCKED" : "PROGRESS"}</span>
                <span>{badge.progressText}</span>
              </div>

              {/* Progress Rail */}
              <div
                style={{
                  width: "100%",
                  height: 4,
                  background: "var(--bg-surface)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${badge.progressPercent}%`,
                    height: "100%",
                    background: badge.unlocked ? badge.color : "var(--text-muted)",
                    borderRadius: 2,
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
