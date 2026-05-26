"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import { useAudio } from "../hooks/useAudio";
import {
  type ChordType,
  type ChordCategory,
  CHORD_TYPE_LABELS,
  CHORD_INTERVALS,
  generateChordNotes,
  SEMITONES_TO_NOTE,
} from "./utils/chordTypes";
import type { NoteName } from "../types";
import { addXP } from "../../profile/utils/userState";

interface PianoKey {
  note: NoteName;
  octave: number;
}

const WHITE_KEYS: PianoKey[] = [
  { note: "C", octave: 4 },
  { note: "D", octave: 4 },
  { note: "E", octave: 4 },
  { note: "F", octave: 4 },
  { note: "G", octave: 4 },
  { note: "A", octave: 4 },
  { note: "B", octave: 4 },
  { note: "C", octave: 5 },
  { note: "D", octave: 5 },
  { note: "E", octave: 5 },
  { note: "F", octave: 5 },
  { note: "G", octave: 5 },
  { note: "A", octave: 5 },
  { note: "B", octave: 5 },
];

interface BlackKey {
  note: NoteName;
  octave: number;
  left: number;
}

const BLACK_KEYS: BlackKey[] = [
  // Octave 4
  { note: "C#", octave: 4, left: (1 / 14) * 100 - 2.25 },
  { note: "D#", octave: 4, left: (2 / 14) * 100 - 2.25 },
  { note: "F#", octave: 4, left: (4 / 14) * 100 - 2.25 },
  { note: "G#", octave: 4, left: (5 / 14) * 100 - 2.25 },
  { note: "A#", octave: 4, left: (6 / 14) * 100 - 2.25 },
  // Octave 5
  { note: "C#", octave: 5, left: (8 / 14) * 100 - 2.25 },
  { note: "D#", octave: 5, left: (9 / 14) * 100 - 2.25 },
  { note: "F#", octave: 5, left: (11 / 14) * 100 - 2.25 },
  { note: "G#", octave: 5, left: (12 / 14) * 100 - 2.25 },
  { note: "A#", octave: 5, left: (13 / 14) * 100 - 2.25 },
];

interface SessionResult {
  score: number;
  accuracy: number;
  maxCombo: number;
  correctAnswers: number;
  totalAttempts: number;
  xpGained: number;
}

export default function ChordsTraining() {
  const { playChord, playNote, playSuccess, playError, isLoaded } = useAudio();

  // ── Mode States ──
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");

  // ── Learn Mode Selector States ──
  const [selectedRoot, setSelectedRoot] = useState<NoteName>("C");
  const [selectedType, setSelectedType] = useState<ChordType>("Major");

  // ── Quiz Mode States ──
  const [quizPhase, setQuizPhase] = useState<"idle" | "playing" | "feedback" | "result">("idle");
  const [categoryFilter, setCategoryFilter] = useState<ChordCategory>("triads");
  const [correctChord, setCorrectChord] = useState<{ root: NoteName; type: ChordType } | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizFeedback, setQuizFeedback] = useState<{ chosen: string; correct: boolean } | null>(null);
  const [lastSessionResult, setLastSessionResult] = useState<SessionResult | null>(null);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine active chord notes for highlight
  const activeChordNotes = useMemo(() => {
    if (activeTab === "learn") {
      return generateChordNotes(selectedRoot, selectedType, 4);
    }
    if (activeTab === "quiz" && correctChord) {
      // In Quiz Mode, we only show notes after user submits their choice (feedback phase)
      if (quizPhase === "feedback") {
        return generateChordNotes(correctChord.root, correctChord.type, 4);
      }
    }
    return [];
  }, [activeTab, selectedRoot, selectedType, correctChord, quizPhase]);

  // ── Learn: Play Chord Action ──
  const handlePlayLearnChord = () => {
    playChord(activeChordNotes);
  };

  // ── Generate Quiz Question ──
  const spawnQuestion = useCallback(() => {
    // 1. Pick a random root note (bias towards natural white keys mostly, occasional sharp)
    const roots: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const root = roots[Math.floor(Math.random() * roots.length)];

    // 2. Pick a random chord type based on selected categories
    const triadTypes: ChordType[] = ["Major", "Minor", "Diminished", "Augmented"];
    const seventhTypes: ChordType[] = ["Maj7", "Min7", "Dom7", "HalfDim7"];
    const pool =
      categoryFilter === "triads"
        ? triadTypes
        : categoryFilter === "sevenths"
        ? seventhTypes
        : [...triadTypes, ...seventhTypes];

    const type = pool[Math.floor(Math.random() * pool.length)];
    const correctLabel = `${root} ${CHORD_TYPE_LABELS[type]}`;

    // 3. Generate 3 unique distractors (incorrect choices)
    const distractors = new Set<string>();
    while (distractors.size < 3) {
      // Try either changing root note or changing chord type to make it challenging
      const rRoot = roots[Math.floor(Math.random() * roots.length)];
      const rType = pool[Math.floor(Math.random() * pool.length)];
      const label = `${rRoot} ${CHORD_TYPE_LABELS[rType]}`;
      if (label !== correctLabel) {
        distractors.add(label);
      }
    }

    // Combine correct answer and distractors, then shuffle
    const combined = [correctLabel, ...Array.from(distractors)];
    combined.sort(() => Math.random() - 0.5);

    setCorrectChord({ root, type });
    setQuizOptions(combined);
    setQuizFeedback(null);
    setQuizPhase("playing");

    // Play the chord polyphonically
    const notes = generateChordNotes(root, type, 4);
    playChord(notes);
  }, [categoryFilter, playChord]);

  // ── Replay Quiz Chord ──
  const handleReplayQuizChord = () => {
    if (correctChord) {
      const notes = generateChordNotes(correctChord.root, correctChord.type, 4);
      playChord(notes);
    }
  };

  // ── Start Quiz Game Loop ──
  const handleStartQuiz = () => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setTimeLeft(60);
    setQuizPhase("playing");
    setLastSessionResult(null);

    // Spawn first question
    setTimeout(() => {
      spawnQuestion();
    }, 200);

    // Start timer interval
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleEndQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── End Quiz Game Loop ──
  const handleEndQuiz = () => {
    setQuizPhase("result");
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Calculate dynamic XP rewards
    const acc = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    let xpReward = Math.round(score * 0.4);
    if (acc >= 90 && totalAttempts >= 4) xpReward += 150; // excellence bonus
    else if (acc >= 70 && totalAttempts >= 4) xpReward += 50; // pass bonus
    xpReward = Math.max(10, xpReward); // minimum 10 XP

    addXP(xpReward);

    const result: SessionResult = {
      score,
      accuracy: acc,
      maxCombo,
      correctAnswers: correctAttempts,
      totalAttempts,
      xpGained: xpReward,
    };

    setLastSessionResult(result);
    setCorrectChord(null);

    // Log to standard practice history under "Chords Quiz"
    try {
      const historyItem = {
        playedAt: Date.now(),
        score,
        accuracy: acc,
        maxCombo,
        totalAttempts,
        correctAttempts,
        title: "Chords Quiz",
        type: "Chords Trainer",
      };
      
      const trainingKey = localStorage.getItem("alpha-last-active-email")
        ? `alpha-training-history-${localStorage.getItem("alpha-last-active-email")}`
        : "alpha-training-history";

      const trSaved = localStorage.getItem(trainingKey);
      const recentHistory = trSaved ? JSON.parse(trSaved) : [];
      const nextHistory = [historyItem, ...recentHistory.slice(0, 9)];
      localStorage.setItem(trainingKey, JSON.stringify(nextHistory));
    } catch (err) {
      console.error("Failed to log chords session:", err);
    }
  };

  // ── Handle Choice Click ──
  const handleGuessSubmit = (optionLabel: string) => {
    if (quizPhase !== "playing" || !correctChord) return;

    const correctLabel = `${correctChord.root} ${CHORD_TYPE_LABELS[correctChord.type]}`;
    const isCorrect = optionLabel === correctLabel;

    setTotalAttempts((prev) => prev + 1);
    
    if (isCorrect) {
      playSuccess();
      setScore((prev) => prev + 15 + combo * 5);
      setCombo((prev) => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setCorrectAttempts((prev) => prev + 1);
      setQuizFeedback({ chosen: optionLabel, correct: true });
    } else {
      playError();
      setCombo(0);
      setQuizFeedback({ chosen: optionLabel, correct: false });
    }

    setQuizPhase("feedback");

    // Advance to next question after feedback pause
    setTimeout(() => {
      if (timeLeft > 0) {
        spawnQuestion();
      }
    }, isCorrect ? 1400 : 2500); // give longer pause on incorrect so they can inspect illuminated keys
  };

  // Clean up timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Sync state tab switches
  const handleTabSwitch = (tab: "learn" | "quiz") => {
    setActiveTab(tab);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setQuizPhase("idle");
    setCorrectChord(null);
    setQuizFeedback(null);
  };

  // Helper styles to determine active highlighted key states
  const getPianoKeyHighlight = (note: NoteName, octave: number) => {
    // Search if note matches active target notes
    const match = activeChordNotes.find(
      (n: any) => n.note === note && n.octave === octave
    );
    if (!match) return null;

    // Distinguish root note with vibrant gold, intervals with sleek teal
    const isRoot = note === (activeTab === "learn" ? selectedRoot : correctChord?.root);
    return isRoot ? "root" : "interval";
  };

  return (
    <>
      <TopNav />
      <SideNav />
      <div
        className="main-layout min-h-screen flex flex-col"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        {/* ── Top Bar ── */}
        <header
          className="sub-header-layout fixed top-14 right-0 z-40 flex items-center justify-between px-6 h-12"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--bg-border)" }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              style={{ color: "var(--text-sub)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-sub)")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </Link>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)" }}>
              chords training
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isLoaded && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-sub)" }}>
                loading salamander piano sampler…
              </span>
            )}
            {isLoaded && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--accent)" }}>
                grand piano ready ✓
              </span>
            )}
          </div>
        </header>

        {/* ── Main Viewport ── */}
        <main
          className="flex-1 flex flex-col items-center justify-center pt-28 px-6 pb-8"
          style={{ maxWidth: 840, width: "100%", margin: "0 auto" }}
        >
          {/* ── Navigation Tab Switches ── */}
          <div
            style={{
              display: "flex",
              background: "var(--bg-surface)",
              borderRadius: 8,
              padding: 4,
              border: "1px solid var(--bg-border)",
              marginBottom: 32,
              width: "max-content",
            }}
          >
            {[
              { id: "learn", label: "Chord Explorer", icon: "explore" },
              { id: "quiz", label: "Ear Training Quiz", icon: "quiz" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id as any)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? "var(--accent)" : "var(--text-sub)",
                  background: activeTab === tab.id ? "var(--bg-raised)" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════ */}
          {/*              TAB 1: CHORD EXPLORER          */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === "learn" && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                animation: "mtFadeIn 0.3s ease",
              }}
            >
              {/* Reference description */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                  Interactive Chord Explorer
                </h2>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", maxWidth: 500, margin: "0 auto" }}>
                  Select different formulas below to instantly inspect their intervals, light up active key scales, and listen to the piano block.
                </p>
              </div>

              {/* Selector Grids */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 2fr",
                  gap: 20,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--bg-border)",
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                {/* Root Selection Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    ROOT NOTE
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 6,
                    }}
                  >
                    {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((note) => (
                      <button
                        key={note}
                        onClick={() => { setSelectedRoot(note as NoteName); playNote(note as NoteName); }}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12.5,
                          fontWeight: selectedRoot === note ? 700 : 400,
                          color: selectedRoot === note ? "var(--bg)" : "var(--text)",
                          background: selectedRoot === note ? "var(--accent)" : "var(--bg-raised)",
                          border: selectedRoot === note ? "none" : "1px solid var(--bg-border)",
                          borderRadius: 6,
                          padding: "8px 0",
                          cursor: "pointer",
                          transition: "all 0.1s",
                        }}
                      >
                        {note.replace("#", "♯")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chord Type Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                    CHORD FORMULA
                  </span>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 8,
                    }}
                  >
                    {(["Major", "Minor", "Diminished", "Augmented", "Maj7", "Min7", "Dom7", "HalfDim7"] as ChordType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 12,
                          textAlign: "left",
                          fontWeight: selectedType === type ? 700 : 400,
                          color: selectedType === type ? "var(--accent)" : "var(--text-sub)",
                          background: selectedType === type ? "var(--bg-surface)" : "var(--bg-raised)",
                          border: selectedType === type ? "1px solid var(--accent)" : "1px solid var(--bg-border)",
                          borderRadius: 6,
                          padding: "10px 14px",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{CHORD_TYPE_LABELS[type]}</span>
                        <span style={{ fontSize: 9, opacity: 0.5 }}>
                          [{CHORD_INTERVALS[type].join("-")}]
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graphical Play Deck */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg-surface)",
                  borderRadius: 10,
                  padding: "16px 24px",
                  border: "1px solid var(--bg-border)",
                }}
              >
                <div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)" }}>
                    ACTIVE SCALE CHORD
                  </span>
                  <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--accent)", marginTop: 2 }}>
                    {selectedRoot.replace("#", "♯")} {CHORD_TYPE_LABELS[selectedType]}
                  </h3>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    {activeChordNotes.map((n: any, i: number) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          color: "var(--text-sub)",
                          background: "var(--bg-raised)",
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "1px solid var(--bg-border)",
                        }}
                      >
                        {n.note.replace("#", "♯")}{n.octave}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handlePlayLearnChord}
                  style={{
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: 8,
                    padding: "14px 28px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 0 16px rgba(226, 183, 20, 0.25)",
                    transition: "transform 0.15s, opacity 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span className="material-symbols-outlined">volume_up</span>
                  <span>Play Chord</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/*              TAB 2: EAR TRAINING QUIZ      */}
          {/* ═══════════════════════════════════════════ */}
          {activeTab === "quiz" && (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                animation: "mtFadeIn 0.3s ease",
              }}
            >
              {/* IDLE / START SCREEN */}
              {quizPhase === "idle" && (
                <div
                  style={{
                    maxWidth: 480,
                    width: "100%",
                    margin: "0 auto",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 48,
                      color: "var(--accent)",
                      marginBottom: 16,
                      animation: "timerPulse 1.5s infinite alternate",
                      display: "inline-block",
                    }}
                  >
                    graphic_eq
                  </span>
                  <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                    Chords Identification Quiz
                  </h3>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 28 }}>
                    Test your ear! Listen to the polyphonic block chord played by the sampler and correctly identify the root note and chord formula under a 60-second timer limit.
                  </p>

                  {/* Config row */}
                  <div
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--bg-border)",
                      borderRadius: 10,
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 32,
                    }}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                      CHORDS CATEGORY
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { id: "triads", label: "Triads" },
                        { id: "sevenths", label: "Sevenths" },
                        { id: "all", label: "All Chords" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCategoryFilter(item.id as ChordCategory)}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 10.5,
                            fontWeight: categoryFilter === item.id ? 700 : 400,
                            color: categoryFilter === item.id ? "var(--accent)" : "var(--text-sub)",
                            background: categoryFilter === item.id ? "var(--bg-raised)" : "transparent",
                            border: "none",
                            borderRadius: 4,
                            padding: "6px 12px",
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleStartQuiz}
                    style={{
                      width: "100%",
                      background: "var(--accent)",
                      color: "var(--bg)",
                      border: "none",
                      borderRadius: 8,
                      padding: "14px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                  >
                    Start 60s Chords Challenge
                  </button>
                </div>
              )}

              {/* GAMEPLAY / PLAYING & FEEDBACK SCREEN */}
              {(quizPhase === "playing" || quizPhase === "feedback") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Stats Bar */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 12,
                      width: "100%",
                    }}
                  >
                    <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "8px 12px", textAlign: "center", border: "1px solid var(--bg-border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)" }}>score</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{score}</div>
                    </div>
                    <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "8px 12px", textAlign: "center", border: "1px solid var(--bg-border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)" }}>acc</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>
                        {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}%
                      </div>
                    </div>
                    <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "8px 12px", textAlign: "center", border: "1px solid var(--bg-border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)" }}>combo</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: combo >= 4 ? "var(--accent)" : "var(--text)" }}>
                        {combo}×
                      </div>
                    </div>
                    <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: "8px 12px", textAlign: "center", border: "1px solid var(--bg-border)" }}>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-muted)" }}>time</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: timeLeft <= 10 ? "var(--wrong)" : "var(--accent)" }}>
                        {timeLeft}s
                      </div>
                    </div>
                  </div>

                  {/* Audio deck controller */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      background: "var(--bg-surface)",
                      borderRadius: 12,
                      padding: "24px 0",
                      border: "1px solid var(--bg-border)",
                    }}
                  >
                    <button
                      onClick={handleReplayQuizChord}
                      style={{
                        background: "var(--accent)",
                        color: "var(--bg)",
                        border: "none",
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        boxShadow: "0 0 16px rgba(226, 183, 20, 0.2)",
                        transition: "transform 0.1s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 28 }}>replay</span>
                    </button>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-sub)" }}>
                      Tap to replay the mystery chord block
                    </div>
                  </div>

                  {/* Multiple Choice Quiz panel */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                    }}
                  >
                    {quizOptions.map((option, idx) => {
                      const isFeedback = quizPhase === "feedback";
                      const correctLabel = correctChord ? `${correctChord.root} ${CHORD_TYPE_LABELS[correctChord.type]}` : "";
                      const isOptionCorrect = option === correctLabel;
                      
                      let bg = "var(--bg-surface)";
                      let border = "1px solid var(--bg-border)";
                      let color = "var(--text-sub)";

                      if (isFeedback) {
                        if (isOptionCorrect) {
                          bg = "var(--accent-sub)";
                          border = "1px solid var(--correct)";
                          color = "var(--correct)";
                        } else if (quizFeedback?.chosen === option) {
                          bg = "rgba(202, 71, 84, 0.12)";
                          border = "1px solid var(--wrong)";
                          color = "var(--wrong)";
                        } else {
                          bg = "var(--bg-surface)";
                          opacity: 0.4;
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isFeedback}
                          onClick={() => handleGuessSubmit(option)}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13.5,
                            fontWeight: 700,
                            color,
                            background: bg,
                            border,
                            borderRadius: 8,
                            padding: "16px 20px",
                            cursor: isFeedback ? "default" : "pointer",
                            transition: "all 0.15s",
                            textAlign: "center",
                          }}
                          onMouseEnter={(e) => { if (!isFeedback) { e.currentTarget.style.borderColor = "var(--accent)"; } }}
                          onMouseLeave={(e) => { if (!isFeedback) { e.currentTarget.style.borderColor = "var(--bg-border)"; } }}
                        >
                          {option.replace("#", "♯")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RESULT VIEW */}
              {quizPhase === "result" && lastSessionResult && (
                <div
                  style={{
                    maxWidth: 520,
                    width: "100%",
                    margin: "0 auto",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--bg-border)",
                    borderRadius: 12,
                    padding: "36px 40px",
                    textAlign: "center",
                    animation: "fadeInUp 0.35s ease forwards",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 48,
                      color: "var(--accent)",
                      marginBottom: 12,
                    }}
                  >
                    emoji_events
                  </span>
                  <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                    Quiz Completed!
                  </h3>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginBottom: 28 }}>
                    Excellent training. Your details have been securely logged.
                  </p>

                  {/* Stats Summary Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 16,
                      marginBottom: 32,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>FINAL SCORE</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--text)" }}>{lastSessionResult.score}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>ACCURACY</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{lastSessionResult.accuracy}%</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>XP REWARD</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "var(--correct)" }}>+{lastSessionResult.xpGained} XP</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      onClick={handleStartQuiz}
                      style={{
                        flex: 1,
                        background: "var(--accent)",
                        color: "var(--bg)",
                        border: "none",
                        borderRadius: 6,
                        padding: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Start New Attempt
                    </button>
                    <button
                      onClick={() => setQuizPhase("idle")}
                      style={{
                        flex: 1,
                        background: "transparent",
                        color: "var(--text-sub)",
                        border: "1px solid var(--bg-border)",
                        borderRadius: 6,
                        padding: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      Quiz Lobby
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/*              SHARED CHORD PIANO DECK       */}
          {/* ═══════════════════════════════════════════ */}
          {/* We display the virtual piano below selectors in Explorer and below choices in Quiz Mode! */}
          {quizPhase !== "result" && quizPhase !== "idle" && (
            <div
              style={{
                width: "100%",
                marginTop: 40,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                animation: "fadeInUp 0.35s ease forwards",
              }}
            >
              {/* White & Black Keys Grid layout */}
              <div
                style={{
                  width: "100%",
                  height: 180,
                  position: "relative",
                  userSelect: "none",
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid var(--bg-border)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                  background: "var(--bg-surface)",
                }}
              >
                {/* 1. White Keys */}
                <div style={{ position: "absolute", inset: 0, display: "flex" }}>
                  {WHITE_KEYS.map(({ note, octave }) => {
                    const highlight = getPianoKeyHighlight(note, octave);
                    let bg = "#e8e8e8";
                    let color = "#646669";
                    
                    if (highlight === "root") {
                      bg = "var(--accent)"; // gold root highlight
                      color = "var(--bg)";
                    } else if (highlight === "interval") {
                      bg = "#34d399"; // emerald interval notes
                      color = "#13543d";
                    }

                    return (
                      <button
                        key={`${note}${octave}`}
                        onMouseDown={() => playNote(note, octave)}
                        style={{
                          flex: 1,
                          height: "100%",
                          background: bg,
                          color,
                          borderRight: "1px solid #c0c0c0",
                          borderBottom: "none",
                          borderTop: "none",
                          borderLeft: "none",
                          cursor: "pointer",
                          transition: "all 0.1s ease",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          paddingBottom: 8,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {note}
                      </button>
                    );
                  })}
                </div>

                {/* 2. Black Keys */}
                {BLACK_KEYS.map(({ note, octave, left }) => {
                  const highlight = getPianoKeyHighlight(note, octave);
                  let bg = "#181818";
                  let color = "#646669";

                  if (highlight === "root") {
                    bg = "var(--accent)"; // gold root highlight
                    color = "var(--bg)";
                  } else if (highlight === "interval") {
                    bg = "#34d399"; // emerald interval notes
                    color = "#13543d";
                  }

                  return (
                    <button
                      key={`${note}${octave}`}
                      onMouseDown={() => playNote(note, octave)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: `${left}%`,
                        width: "4.5%",
                        height: "58%",
                        background: bg,
                        color,
                        border: "none",
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        zIndex: 10,
                        cursor: "pointer",
                        transition: "all 0.1s ease",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        paddingBottom: 6,
                        boxShadow: "0 3px 6px rgba(0,0,0,0.5), inset 0 -2px 0 rgba(0,0,0,0.2)",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 8.5,
                        fontWeight: 700,
                      }}
                    >
                      {note.replace("#", "♯")}
                    </button>
                  );
                })}
              </div>

              {/* Legend labels */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginTop: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                  <span>Chord Root Note</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
                  <span>Chord Intervals</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
