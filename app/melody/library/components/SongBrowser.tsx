"use client";
import React, { useState, useMemo } from "react";
import type { SongMetadata, LibraryDifficulty } from "../types";
import { LIVES_BY_DIFF } from "../../data/packs";
import MidiUploader from "./MidiUploader";

interface Props {
  songs: SongMetadata[];
  unlockedSongs: string[];
  favorites: string[];
  recentHistory: any[];
  toggleFavorite: (songId: string) => void;
  onSelectSong: (song: SongMetadata) => void;
  onAddCustomSong: (song: SongMetadata) => void;
}

export default function SongBrowser({
  songs,
  unlockedSongs,
  favorites,
  recentHistory,
  toggleFavorite,
  onSelectSong,
  onAddCustomSong,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedDiff, setSelectedDiff] = useState<number | "All">("All");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<"difficulty_asc" | "difficulty_desc" | "notes_desc">("difficulty_asc");
  const [customSongs, setCustomSongs] = useState<SongMetadata[]>([]);

  // Genres gathered dynamically
  const genres = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => set.add(s.genre));
    customSongs.forEach((s) => set.add(s.genre));
    return ["All", ...Array.from(set)];
  }, [songs, customSongs]);

  // Combine default database with custom-uploaded songs
  const allSongs = useMemo(() => {
    return [...songs, ...customSongs];
  }, [songs, customSongs]);

  // Handle custom song import from parser
  const handleSongParsed = (song: SongMetadata) => {
    setCustomSongs((prev) => [song, ...prev]);
    onAddCustomSong(song);
  };

  // Filtered & Sorted list
  const filteredSongs = useMemo(() => {
    return allSongs
      .filter((s) => {
        const matchesSearch =
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.artist.toLowerCase().includes(search.toLowerCase());
        const matchesGenre = selectedGenre === "All" || s.genre === selectedGenre;
        const matchesDiff = selectedDiff === "All" || s.difficulty === selectedDiff;
        const matchesFav = !showOnlyFavorites || favorites.includes(s.id);
        return matchesSearch && matchesGenre && matchesDiff && matchesFav;
      })
      .sort((a, b) => {
        if (sortBy === "difficulty_asc") return a.difficulty - b.difficulty;
        if (sortBy === "difficulty_desc") return b.difficulty - a.difficulty;
        if (sortBy === "notes_desc") return b.notes.length - a.notes.length;
        return 0;
      });
  }, [allSongs, search, selectedGenre, selectedDiff, showOnlyFavorites, favorites, sortBy]);

  // Render difficulty dots
  const renderDifficulty = (diff: LibraryDifficulty, color: string) => {
    return (
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: i < diff ? color : "var(--bg-raised)",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ animation: "fadeInUp 0.35s ease forwards" }}>
      {/* Header Banner */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
          master standard repertoire
        </div>
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 10 }}>
          Melody Library System
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-sub)", maxWidth: 640 }}>
          Unlock and master classic songs, loops, and custom-uploaded MIDI tracks. Play notes entirely by audio and reproduce them with zero visual guidance.
        </p>
      </div>

      {/* Grid: Search & Filters Left, MIDI Drag-and-Drop Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr minmax(300px, 350px)", gap: 24, alignItems: "start", marginBottom: 32 }}>
        {/* Filters Box */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--bg-border)",
            borderRadius: 12,
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Search Row */}
          <div style={{ position: "relative", display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span className="material-symbols-outlined" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 18 }}>
                search
              </span>
              <input
                type="text"
                placeholder="Search songs, composers, compositions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  background: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "var(--text)",
                }}
              />
            </div>

            <button
              onClick={() => setShowOnlyFavorites((prev) => !prev)}
              style={{
                background: showOnlyFavorites ? "var(--accent-sub)" : "var(--bg-raised)",
                border: `1px solid ${showOnlyFavorites ? "var(--accent)" : "var(--bg-border)"}`,
                borderRadius: 8,
                padding: "0 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: showOnlyFavorites ? "var(--accent)" : "var(--text-sub)",
                transition: "all 0.15s",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: showOnlyFavorites ? "var(--accent)" : "var(--text-muted)" }}>
                favorite
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>Favorites</span>
            </button>
          </div>

          {/* Genre Filters Row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}>GENRE:</span>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 20,
                  cursor: "pointer",
                  background: selectedGenre === genre ? "var(--accent)" : "var(--bg-raised)",
                  color: selectedGenre === genre ? "var(--bg)" : "var(--text-sub)",
                  border: "1px solid var(--bg-border)",
                  transition: "all 0.15s",
                }}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Difficulty & Sort Row */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>DIFFICULTY:</span>
              <select
                value={selectedDiff}
                onChange={(e) => setSelectedDiff(e.target.value === "All" ? "All" : parseInt(e.target.value))}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "var(--text)",
                }}
              >
                <option value="All">All Tiers</option>
                <option value="1">Tier 1 - Beginner</option>
                <option value="2">Tier 2 - Easy</option>
                <option value="3">Tier 3 - Medium</option>
                <option value="4">Tier 4 - Hard</option>
                <option value="5">Tier 5 - Expert</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "var(--text)",
                }}
              >
                <option value="difficulty_asc">Easiest First</option>
                <option value="difficulty_desc">Hardest First</option>
                <option value="notes_desc">Notes Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* MIDI Uploader Right */}
        <MidiUploader onSongParsed={handleSongParsed} />
      </div>

      {/* Song Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}>
        {filteredSongs.map((song) => {
          const isUnlocked = unlockedSongs.includes(song.id) || song.isCustom;
          const isFav = favorites.includes(song.id);
          const color = song.thumbnail || "var(--accent)";

          return (
            <div
              key={song.id}
              style={{
                position: "relative",
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 12,
                padding: "20px 20px",
                display: "flex",
                flexDirection: "column",
                opacity: isUnlocked ? 1 : 0.45,
                transition: "border-color 0.15s, transform 0.15s",
              }}
            >
              {/* Card Color Bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  borderRadius: "12px 0 0 12px",
                  backgroundColor: color,
                }}
              />

              {/* Fav Icon */}
              {isUnlocked && (
                <button
                  onClick={() => toggleFavorite(song.id)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: 14,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      color: isFav ? "var(--wrong)" : "var(--text-muted)",
                      transition: "color 0.15s",
                    }}
                  >
                    {isFav ? "favorite" : "favorite_border"}
                  </span>
                </button>
              )}

              {/* Tag / Genre */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    padding: "3px 8px",
                    background: "var(--bg-raised)",
                    borderRadius: 4,
                    color: "var(--text-muted)",
                  }}
                >
                  {song.genre}
                </span>

                {/* Lock Status */}
                {!isUnlocked && (
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>
                    lock
                  </span>
                )}
              </div>

              {/* Title & Artist */}
              <div style={{ flex: 1, marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4, lineHeight: 1.25 }}>
                  {song.title}
                </h3>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                  {song.artist}
                </p>
              </div>

              {/* Metadata details */}
              <div style={{ borderTop: "1px solid var(--bg-border)", paddingTop: 12, marginBottom: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-sub)" }}>
                  <span>Notes: {song.noteCount}</span>
                  <span>Tempo: {song.bpm} BPM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-sub)" }}>
                  <span>Range: {song.octaveRange}</span>
                  <span>Duration: {song.duration}s</span>
                </div>
              </div>

              {/* Difficulty indicators & Action button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                {renderDifficulty(song.difficulty, color)}

                {isUnlocked ? (
                  <button
                    onClick={() => onSelectSong(song)}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "6px 14px",
                      background: color,
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    <span>Practice</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </button>
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                    Unlock accuracy ≥ 80%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
