"use client";
import React, { useState, useEffect } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { useUserProfile, getAggregatedStats } from "../profile/utils/userState";

// Tier solver based on global rating
function getTier(rating: number): string {
  if (rating >= 3200) return "Grandmaster I";
  if (rating >= 3000) return "Master IV";
  if (rating >= 2800) return "Master III";
  if (rating >= 2700) return "Diamond I";
  if (rating >= 2600) return "Diamond II";
  if (rating >= 2500) return "Diamond III";
  if (rating >= 2400) return "Platinum I";
  if (rating >= 2200) return "Platinum II";
  if (rating >= 1800) return "Gold I";
  if (rating >= 1400) return "Silver I";
  return "Bronze I";
}

// Starchart of Mock Athletes
const MOCK_ATHLETES = [
  { name: "AuraPitch", level: 16, rating: 3450, accuracy: 99.8, bio: "Absolute pitch virtuoso | 12-yr-old keyboard speedrunner", avatar: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=150&h=150&fit=crop", socials: { linkedin: "aurapitch", instagram: "aura_ear", github: "aurapitch" }, sessions: 184, maxCombo: 192, trend: "trending_flat", trendColor: "var(--text-muted)" },
  { name: "SonicWave", level: 14, rating: 3104, accuracy: 98.2, bio: "Ear training enthusiast & classical pianist | Master of augmented triads", avatar: "avatar_color:#c0c0c0", socials: { linkedin: "sonicwave", instagram: "sonicwave_keys" }, sessions: 132, maxCombo: 145, trend: "trending_up", trendColor: "var(--correct)" },
  { name: "RhythmK", level: 13, rating: 2980, accuracy: 96.5, bio: "Percussionist & rhythmic solver | Triad training coach", avatar: "avatar_color:#cd7f32", socials: { instagram: "rhythmk_beats", github: "rhythmk" }, sessions: 110, maxCombo: 118, trend: "trending_up", trendColor: "var(--correct)" },
  { name: "EchoBlade", level: 12, rating: 2850, accuracy: 94.2, bio: "Jazz organist playing experimental minor 7ths", avatar: "avatar_color:#42be65", socials: { linkedin: "echoblade_music", github: "echoblade" }, sessions: 94, maxCombo: 96, trend: "trending_up", trendColor: "var(--correct)" },
  { name: "VelocityX", level: 11, rating: 2795, accuracy: 93.8, bio: "Speed recognition ear trainer | Electronic keyboardist", avatar: "avatar_color:#be95ff", socials: { instagram: "velocityx_synths" }, sessions: 85, maxCombo: 80, trend: "trending_flat", trendColor: "var(--text-muted)" },
  { name: "PitchPerfect", level: 11, rating: 2710, accuracy: 92.1, bio: "Perfect pitch trainer & multi-instrumentalist", avatar: "avatar_color:#0f62fe", socials: { linkedin: "pitchperfect" }, sessions: 76, maxCombo: 72, trend: "trending_down", trendColor: "var(--wrong)" },
  { name: "HarmoniQ", level: 10, rating: 2640, accuracy: 90.5, bio: "Chords master. Solves diminished triads under 5s", avatar: "avatar_color:#ebbcba", socials: { instagram: "harmoniq_chord" }, sessions: 68, maxCombo: 64, trend: "trending_up", trendColor: "var(--correct)" },
  { name: "NoteForge", level: 10, rating: 2580, accuracy: 89.3, bio: "Software engineer & cellist coding interactive piano grids", avatar: "avatar_color:#80cbc4", socials: { github: "noteforge" }, sessions: 54, maxCombo: 58, trend: "trending_flat", trendColor: "var(--text-muted)" },
  { name: "KeyMaster", level: 9, rating: 2410, accuracy: 88.0, bio: "Sight-reading specialist learning flat/sharp variations", avatar: "avatar_color:#ef5350", socials: { linkedin: "keymaster" }, sessions: 48, maxCombo: 45, trend: "trending_flat", trendColor: "var(--text-muted)" },
  { name: "OctaveRun", level: 8, rating: 2250, accuracy: 86.4, bio: "Mastering intervals across two octaves", avatar: "avatar_color:#c792ea", socials: { instagram: "octaverun" }, sessions: 36, maxCombo: 34, trend: "trending_flat", trendColor: "var(--text-muted)" },
  { name: "ToneDeafNoMore", level: 2, rating: 1300, accuracy: 72.0, bio: "Started my ear training journey yesterday!", avatar: "avatar_color:#acafbe", socials: { github: "tonedeafnomore" }, sessions: 6, maxCombo: 8, trend: "trending_up", trendColor: "var(--correct)" }
];

const GLOW: Record<string, React.CSSProperties> = {
  gold:   { boxShadow: "0 0 24px rgba(255,215,0,0.45)",   border: "2px solid rgba(255,215,0,0.6)" },
  silver: { boxShadow: "0 0 20px rgba(192,192,192,0.35)", border: "2px solid rgba(192,192,192,0.5)" },
  bronze: { boxShadow: "0 0 18px rgba(205,127,50,0.35)",  border: "2px solid rgba(205,127,50,0.5)" },
};

export default function Leaderboard() {
  const profile = useUserProfile();
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<any | null>(null);
  const [visibleRowsCount, setVisibleRowsCount] = useState(5);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setStats(getAggregatedStats());
    }
  }, [profile]);

  // Compute active user rating & average accuracy
  const userRating = 1000 + profile.level * 150 + Math.round(profile.xp / 10);
  const userAccuracy = stats ? (stats.avgAccuracy || 78) : 78;

  // Construct combined ranked list of all athletes
  const allAthletes = [
    ...MOCK_ATHLETES,
    {
      name: profile.provider !== "none" ? profile.username : "Guest Player",
      level: profile.level,
      rating: userRating,
      accuracy: userAccuracy,
      bio: profile.bio || "Aspiring musical virtuoso training for elite perfect pitch.",
      avatar: profile.avatarUrl,
      socials: {
        linkedin: profile.linkedin || "",
        instagram: profile.instagram || "",
        github: profile.github || ""
      },
      sessions: stats ? stats.totalSessions : 0,
      maxCombo: stats ? stats.maxCombo : 0,
      trend: "trending_up",
      trendColor: "var(--correct)",
      isCurrentUser: true
    }
  ];

  // Sort by rating descending
  allAthletes.sort((a, b) => b.rating - a.rating);

  // Map rank indexes
  const rankedAthletes = allAthletes.map((ath, idx) => ({
    ...ath,
    rank: idx + 1
  }));

  // Apply search filtering
  const filteredAthletes = rankedAthletes.filter(ath => 
    ath.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTier(ath.rating).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract Podium (Top 3 of sorted all list)
  const top1 = rankedAthletes[0];
  const top2 = rankedAthletes[1];
  const top3 = rankedAthletes[2];

  const podiumArray = [
    { ...top2, rankStr: "#2", glow: "silver", h: 290, numColor: "#c0c0c0", delay: "2s" },
    { ...top1, rankStr: "#1", glow: "gold", h: 350, numColor: "#ffd700", delay: "0s" },
    { ...top3, rankStr: "#3", glow: "bronze", h: 270, numColor: "#cd7f32", delay: "4s" },
  ];

  // Table rows starts from rank 4
  const tableRows = filteredAthletes.filter(ath => ath.rank > 3);

  // Detect photo vs color preset
  const getAvatarRender = (avatar: string, initials: string, size = 34, styleProps = {}) => {
    const isPhoto = avatar && (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/"));
    const isColor = avatar && avatar.startsWith("avatar_color:");
    const bg = isPhoto ? "transparent" : (isColor ? avatar.split(":")[1] : "var(--accent)");
    const color = isColor ? "#0f1115" : "var(--bg)";

    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, border: "1px solid var(--bg-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'JetBrains Mono', monospace", fontSize: size > 40 ? 18 : 12, fontWeight: 700, color,
        overflow: "hidden", flexShrink: 0,
        ...styleProps
      }}>
        {isPhoto ? (
          <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </div>
    );
  };

  return (
    <>
      <TopNav />
      <SideNav />

      <main
        className="main-layout"
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
              The elite tier of ear-training athletes. Earn XP to climb ranks dynamically!
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--text-muted)" }}>search</span>
              <input
                placeholder="search athletes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
        {searchQuery === "" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
              marginBottom: 48,
              alignItems: "flex-end",
            }}
          >
            {podiumArray.map((p, i) => {
              const initials = p.name.substring(0, 2).toUpperCase();
              const isUser = !!(p as any).isCurrentUser;
              return (
                <div
                  key={p.rankStr}
                  onClick={() => setSelectedAthlete(p)}
                  style={{
                    order: i === 0 ? 1 : i === 1 ? 0 : 2,
                    height: p.h,
                    background: isUser ? "var(--accent-sub)" : "var(--bg-surface)",
                    border: isUser ? "1px solid var(--accent)" : "1px solid var(--bg-border)",
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "relative",
                    cursor: "pointer",
                    transition: "transform 0.2s, border-color 0.2s",
                    animation: `subtleFloat 6s ease-in-out ${p.delay} infinite`,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    if (!isUser) e.currentTarget.style.borderColor = "var(--text-muted)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    if (!isUser) e.currentTarget.style.borderColor = "var(--bg-border)";
                  }}
                >
                  {/* Crown */}
                  {p.rankStr === "#1" && (
                    <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)" }}>
                      <span className="material-symbols-outlined filled-icon" style={{ fontSize: 32, color: "#eab308" }}>crown</span>
                    </div>
                  )}

                  {/* Dynamic Avatar Container */}
                  <div style={{ position: "absolute", top: -40 }}>
                    {getAvatarRender(p.avatar, initials, 80, GLOW[p.glow])}
                    <div style={{
                      position: "absolute", bottom: -6, right: -6,
                      width: 24, height: 24, borderRadius: "50%",
                      background: "var(--bg)",
                      border: "1px solid var(--bg-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700,
                      color: p.numColor,
                    }}>
                      {p.rankStr.replace("#", "")}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", marginTop: 44, width: "100%" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      {p.name}
                      {isUser && <span style={{ fontSize: 10, background: "var(--accent)", color: "var(--bg)", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>YOU</span>}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--purple)", marginBottom: 16 }}>{getTier(p.rating)}</div>

                    <div style={{ height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                      <div style={{
                        height: "100%",
                        width: `${p.accuracy}%`,
                        background: p.glow === "gold" ? "#ffd700" : "var(--accent)",
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
                      {p.rating.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* rankings Table */}
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
                {tableRows.slice(0, visibleRowsCount).map(row => {
                  const initials = row.name.substring(0, 2).toUpperCase();
                  const isUser = !!(row as any).isCurrentUser;
                  return (
                    <tr
                      key={row.rank}
                      onClick={() => setSelectedAthlete(row)}
                      style={{ 
                        borderBottom: "1px solid var(--bg-border)", 
                        cursor: "pointer", 
                        background: isUser ? "var(--accent-sub)" : "transparent",
                        transition: "background 0.15s" 
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = isUser ? "rgba(226,183,20,0.18)" : "var(--bg-raised)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = isUser ? "var(--accent-sub)" : "transparent"; }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: isUser ? "var(--accent)" : "var(--text-muted)", textAlign: "center", fontWeight: isUser ? 700 : 400 }}>
                        {row.rank}
                      </td>

                      {/* Athlete details */}
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {getAvatarRender(row.avatar, initials, 34)}
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, fontWeight: isUser ? 700 : 600, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                            {row.name}
                            {isUser && <span style={{ fontSize: 9, background: "var(--accent)", color: "var(--bg)", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>YOU</span>}
                          </span>
                        </div>
                      </td>

                      {/* Tier */}
                      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--purple)" }}>
                        {getTier(row.rating)}
                      </td>

                      {/* Accuracy */}
                      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                        {row.accuracy}%
                      </td>

                      {/* Rating */}
                      <td style={{ padding: "16px 20px", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {row.rating.toLocaleString()}
                      </td>

                      {/* Trend */}
                      <td style={{ padding: "16px 20px", textAlign: "center" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20, color: row.trendColor }}>{row.trend}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More option */}
          {tableRows.length > visibleRowsCount && (
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
                onClick={() => setVisibleRowsCount(prev => prev + 5)}
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
          )}
        </div>

        {/* ── Glassmorphic Modal Profile Inspector ── */}
        {selectedAthlete && (
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
            onClick={() => setSelectedAthlete(null)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 440,
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
                onClick={() => setSelectedAthlete(null)}
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

              {/* Inspector Header (Avatar, Name, Tier) */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 24 }}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  {getAvatarRender(selectedAthlete.avatar, selectedAthlete.name.substring(0,2).toUpperCase(), 76, {
                    boxShadow: "0 0 16px var(--accent-sub)",
                    border: "2px solid var(--accent)",
                  })}
                  <div style={{
                    position: "absolute",
                    bottom: -4, right: -4,
                    background: "var(--accent)",
                    color: "var(--bg)",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    width: 22, height: 22,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid var(--bg-surface)"
                  }}>
                    #{selectedAthlete.rank}
                  </div>
                </div>

                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                  {selectedAthlete.name}
                  {selectedAthlete.isCurrentUser && <span style={{ fontSize: 9, background: "var(--accent)", color: "var(--bg)", padding: "1px 5px", borderRadius: 3, fontWeight: 700 }}>YOU</span>}
                </h3>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--purple)", marginTop: 2 }}>
                  {getTier(selectedAthlete.rating)}
                </p>
              </div>

              {/* Bio Block */}
              <div style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 20,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: "var(--text-sub)",
                lineHeight: 1.5,
                textAlign: "center",
                fontStyle: "italic"
              }}>
                "{selectedAthlete.bio}"
              </div>

              {/* Stats Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginBottom: 24
              }}>
                {[
                  { label: "GLOBAL RATING", value: selectedAthlete.rating.toLocaleString(), color: "var(--text)" },
                  { label: "ACCURACY", value: `${selectedAthlete.accuracy}%`, color: "var(--accent)" },
                  { label: "SESSIONS DONE", value: `${selectedAthlete.sessions} tests`, color: "#34d399" },
                  { label: "MAX COMBO", value: `${selectedAthlete.maxCombo} notes`, color: "#ff7a50" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.04em" }}>
                      {stat.label}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div style={{ borderTop: "1px solid var(--bg-border)", paddingTop: 18 }}>
                <span style={{ borderTop: "none", display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 12, textAlign: "center", letterSpacing: "0.08em" }}>
                  SOCIAL NETWORK HANDLES
                </span>
                
                {(!selectedAthlete.socials.linkedin && !selectedAthlete.socials.instagram && !selectedAthlete.socials.github) ? (
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", textAlign: "center", fontStyle: "italic" }}>
                    No social accounts linked
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                    {selectedAthlete.socials.linkedin && (
                      <a
                        href={`https://linkedin.com/in/${selectedAthlete.socials.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`LinkedIn: /in/${selectedAthlete.socials.linkedin}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "var(--bg-raised)", border: "1px solid var(--bg-border)",
                          borderRadius: 8, padding: "8px 14px", textDecoration: "none",
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-sub)",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>link</span>
                        <span>LinkedIn</span>
                      </a>
                    )}

                    {selectedAthlete.socials.instagram && (
                      <a
                        href={`https://instagram.com/${selectedAthlete.socials.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`Instagram: @${selectedAthlete.socials.instagram}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "var(--bg-raised)", border: "1px solid var(--bg-border)",
                          borderRadius: 8, padding: "8px 14px", textDecoration: "none",
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-sub)",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>photo_camera</span>
                        <span>Instagram</span>
                      </a>
                    )}

                    {selectedAthlete.socials.github && (
                      <a
                        href={`https://github.com/${selectedAthlete.socials.github}`}
                        target="_blank"
                        rel="noreferrer"
                        title={`GitHub: @${selectedAthlete.socials.github}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "var(--bg-raised)", border: "1px solid var(--bg-border)",
                          borderRadius: 8, padding: "8px 14px", textDecoration: "none",
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-sub)",
                          transition: "all 0.15s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-sub)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>terminal</span>
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--bg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>Alpha</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>© 2024 Project Alpha</div>
        </footer>
      </main>
    </>
  );
}
