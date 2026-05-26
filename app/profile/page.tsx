"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import {
  useUserProfile,
  logoutUser,
  updateProfile,
  getAggregatedStats,
  getTrainingHistoryKey,
  getLibraryHistoryKey,
  type UserProfile,
  type AggregatedStats,
} from "./utils/userState";
import AuthModal from "./components/AuthModal";
import ProfileStats from "./components/ProfileStats";
import ProgressChart from "./components/ProgressChart";
import ActivityHeatmap from "./components/ActivityHeatmap";
import ProfileBadges from "./components/ProfileBadges";

export default function ProfilePage() {
  const profile = useUserProfile();
  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [linkedinInput, setLinkedinInput] = useState("");
  const [instagramInput, setInstagramInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats>({
    totalNotesPlayed: 0,
    avgAccuracy: 0,
    maxCombo: 0,
    totalScore: 0,
    totalSessions: 0,
    unlockedPacksCount: 2,
    timePracticedMin: 0,
  });

  const [historyList, setHistoryList] = useState<any[]>([]);

  // Update initial username field and stats when profile loads
  useEffect(() => {
    if (profile.provider !== "none") {
      setUsernameInput(profile.username || "");
      setBioInput(profile.bio || "");
      setAvatarUrlInput(profile.avatarUrl || "");
      setLinkedinInput(profile.linkedin || "");
      setInstagramInput(profile.instagram || "");
      setGithubInput(profile.github || "");
      setAggregatedStats(getAggregatedStats());
      
      // Load recent session logs
      const combinedHistory: any[] = [];

      try {
        const libKey = getLibraryHistoryKey();
        const libSaved = localStorage.getItem(libKey);
        if (libSaved) {
          const parsed = JSON.parse(libSaved);
          parsed.forEach((item: any) => {
            combinedHistory.push({
              playedAt: item.playedAt || Date.now(),
              type: "Melody Library",
              title: item.title || "Melody",
              accuracy: item.accuracy || 0,
              score: item.score || 0,
              maxCombo: item.maxCombo || 0,
            });
          });
        }
      } catch {}

      try {
        const trKey = getTrainingHistoryKey();
        const trSaved = localStorage.getItem(trKey);
        if (trSaved) {
          const parsed = JSON.parse(trSaved);
          parsed.forEach((item: any) => {
            combinedHistory.push({
              playedAt: item.playedAt || Date.now(),
              type: "Ear Trainer",
              title: "Interval Practice",
              accuracy: item.accuracy || 0,
              score: item.score || 0,
              maxCombo: item.maxCombo || 0,
            });
          });
        }
      } catch {}

      // Sort by date descending (recent first)
      combinedHistory.sort((a, b) => b.playedAt - a.playedAt);
      setHistoryList(combinedHistory.slice(0, 10)); // Show top 10 sessions
    }
  }, [profile]);

  // Handle profile edit save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    updateProfile({ 
      username: usernameInput.trim(),
      bio: bioInput.trim(),
      avatarUrl: avatarUrlInput.trim(),
      linkedin: linkedinInput.trim(),
      instagram: instagramInput.trim(),
      github: githubInput.trim(),
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <>
      <TopNav />
      <SideNav />
      <div
        className="main-layout min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        {/* ── Header ── */}
        <header
          className="sub-header-layout fixed top-14 right-0 z-40 flex items-center justify-between px-6 h-12"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--bg-border)" }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </Link>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>
              profile & analytics
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {profile.provider !== "none" && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  color: "var(--text)",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-sub)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.color = "var(--text)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>manage_accounts</span>
                <span>Customize Profile</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Main content area ── */}
        <main
          className="flex-1 flex flex-col pt-32 px-8 pb-12"
          style={{ maxWidth: 1000, width: "100%", margin: "0 auto" }}
        >
          {profile.provider === "none" ? (
            /* Authentication Gate Modal */
            <div style={{ marginTop: 20 }}>
              <AuthModal />
            </div>
          ) : (
            /* Dashboard View */
            <div style={{ animation: "fadeInUp 0.3s ease forwards" }}>
              {/* Header Title */}
              <div style={{ marginBottom: 28 }}>
                <h1
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  Dashboard
                </h1>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                  Track your stats, practice trends, levels, and training logs in real-time.
                </p>
              </div>

              {/* Stats overview (Cards + level bar) */}
              <ProfileStats profile={profile} stats={aggregatedStats} />

              {/* SVG Curve Chart */}
              <ProgressChart />

              {/* Activity Heatmap Grid */}
              <ActivityHeatmap />

              {/* Badges Achievements Medallions */}
              <ProfileBadges profile={profile} stats={aggregatedStats} />

              {/* ── Recent Activity Logs (Full Width Dashboard View) ── */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: "28px 32px",
                  animation: "fadeInUp 0.4s ease forwards",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--accent)" }}>
                    history
                  </span>
                  <span>Recent Session Logs</span>
                </h3>

                {historyList.length === 0 ? (
                  <div
                    style={{
                      padding: "48px 0",
                      textAlign: "center",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      border: "1px dashed var(--bg-border)",
                      borderRadius: 8,
                    }}
                  >
                    No sessions logged yet. Complete standard practice or library melodies to see your stats here!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {historyList.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg-raised)",
                          border: "1px solid var(--bg-border)",
                          borderRadius: 8,
                          padding: "14px 18px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          transition: "transform 0.15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(2px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 13,
                              color: "var(--text)",
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            {item.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 9,
                                color: "var(--text-muted)",
                                background: "rgba(255,255,255,0.05)",
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: "1px solid var(--bg-border)",
                              }}
                            >
                              {item.type}
                            </span>
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10,
                                color: "var(--text-muted)",
                              }}
                            >
                              {new Date(item.playedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 15,
                              fontWeight: 700,
                              color: item.accuracy >= 80 ? "var(--accent)" : "var(--text)",
                              marginBottom: 4,
                            }}
                          >
                            {item.accuracy}% Acc
                          </div>
                          <div
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 11,
                              color: "var(--text-muted)",
                            }}
                          >
                            Score: {item.score.toLocaleString()} | Max Combo: {item.maxCombo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ── Glassmorphic Customize Profile Settings Modal ── */}
        {isSettingsOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(8px)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              animation: "fadeIn 0.2s ease-out",
            }}
            onClick={() => setIsSettingsOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 460,
                maxHeight: "90vh",
                overflowY: "auto",
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                borderRadius: 16,
                padding: "32px 28px 28px",
                position: "relative",
                animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text)",
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--accent)" }}>
                  manage_accounts
                </span>
                <span>Customize Profile</span>
              </h3>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    USERNAME
                  </label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Player username"
                    maxLength={25}
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--bg-border)",
                      color: "var(--text)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>

                {/* Bio */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    BIO (MAX 120 CHARACTERS)
                  </label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value.substring(0, 120))}
                    placeholder="Write a short musical bio..."
                    rows={2}
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--bg-border)",
                      color: "var(--text)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                      resize: "none",
                    }}
                  />
                </div>

                {/* Presets */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    CHOOSE AN AVATAR PRESET
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "4px 0" }}>
                    {[
                      { name: "🎧", val: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop", desc: "Headphones" },
                      { name: "🎹", val: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=150&h=150&fit=crop", desc: "Grand Piano" },
                      { name: "✨", val: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&h=150&fit=crop", desc: "Synth" },
                      { name: "🟨", val: "avatar_color:#ffd700", desc: "Gold Gradient" },
                      { name: "🟪", val: "avatar_color:#a855f7", desc: "Purple Gradient" },
                      { name: "🟩", val: "avatar_color:#34d399", desc: "Emerald Gradient" },
                    ].map(preset => {
                      const active = avatarUrlInput === preset.val;
                      return (
                        <button
                          key={preset.val}
                          type="button"
                          title={preset.desc}
                          onClick={() => setAvatarUrlInput(preset.val)}
                          style={{
                            padding: "6px 10px",
                            fontSize: 14,
                            background: active ? "var(--accent-sub)" : "var(--bg-raised)",
                            border: active ? "1px solid var(--accent)" : "1px solid var(--bg-border)",
                            color: active ? "var(--accent)" : "var(--text-sub)",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontFamily: "'JetBrains Mono', monospace",
                            transition: "all 0.15s",
                          }}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom photo URL */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    OR PASTE CUSTOM IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrlInput.startsWith("avatar_color:") ? "" : avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://example.com/photo.png"
                    style={{
                      background: "var(--bg-raised)",
                      border: "1px solid var(--bg-border)",
                      color: "var(--text)",
                      borderRadius: 6,
                      padding: "10px 12px",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>

                {/* Social Links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    SOCIAL LINKS
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-raised)", border: "1px solid var(--bg-border)", borderRadius: 6, paddingLeft: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>link</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>linkedin.com/in/</span>
                    <input
                      type="text"
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                      placeholder="handle"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        padding: "10px 12px 10px 0",
                        fontSize: 13,
                        outline: "none",
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-raised)", border: "1px solid var(--bg-border)", borderRadius: 6, paddingLeft: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>photo_camera</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>instagram.com/</span>
                    <input
                      type="text"
                      value={instagramInput}
                      onChange={(e) => setInstagramInput(e.target.value)}
                      placeholder="handle"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        padding: "10px 12px 10px 0",
                        fontSize: 13,
                        outline: "none",
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-raised)", border: "1px solid var(--bg-border)", borderRadius: 6, paddingLeft: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>terminal</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>github.com/</span>
                    <input
                      type="text"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      placeholder="handle"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text)",
                        padding: "10px 12px 10px 0",
                        fontSize: 13,
                        outline: "none",
                        flex: 1,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>
                </div>

                {/* Save Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <button
                    type="submit"
                    style={{
                      background: "var(--accent)",
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: 6,
                      padding: "10px 16px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    Save Settings
                  </button>

                  {isSavedNotice && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: "#34d399",
                        animation: "fadeIn 0.2s ease",
                      }}
                    >
                      ✓ Saved!
                    </span>
                  )}
                </div>
              </form>

              <div style={{ margin: "20px 0", height: 1, background: "var(--bg-border)" }} />

              <button
                onClick={() => {
                  logoutUser();
                  signOut({ callbackUrl: "/profile" });
                }}
                style={{
                  background: "transparent",
                  color: "#ca4754",
                  border: "1px solid rgba(202, 71, 84, 0.3)",
                  borderRadius: 6,
                  padding: "10px 16px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  width: "100%",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(202, 71, 84, 0.1)";
                  e.currentTarget.style.borderColor = "#ca4754";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(202, 71, 84, 0.3)";
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
