"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import SideNav from "../components/SideNav";
import { useAudio } from "./hooks/useAudio";
import { useKeyboard } from "./hooks/useKeyboard";
import { useGameEngine } from "./hooks/useGameEngine";
import { PianoKeyboard } from "./components/PianoKeyboard";
import { NoteChallenge } from "./components/NoteChallenge";
import { SessionStats } from "./components/SessionStats";
import {
  DEFAULT_CONFIG,
  NOTE_TO_KEY,
  ENHARMONIC_MAP,
  type NoteName,
  type GameConfig,
} from "./types";

export default function Training() {
  const { playNote, playSuccess, playError, isLoaded } = useAudio();

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [blindMode, setBlindMode] = useState<boolean>(true);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [lastPoints, setLastPoints] = useState<number>(0);
  const comparisonScheduled = useRef(false);
  const currentNoteRef = useRef<NoteName | null>(null);

  const callbacks = useMemo(
    () => ({
      onPlayNote: (note: NoteName) => {
        currentNoteRef.current = note;
        playNote(note);
      },
      onCorrect: () => void playSuccess(),
      onWrong: () => void playError(),
    }),
    [playNote, playSuccess, playError]
  );

  const { state, accuracy, start, guess, replay, reset } = useGameEngine(config, callbacks);

  const togglePracticeOption = useCallback((key: keyof GameConfig) => {
    setConfig((prev) => {
      const activeCount =
        (prev.practiceNatural ? 1 : 0) +
        (prev.practiceSharp ? 1 : 0) +
        (prev.practiceFlat ? 1 : 0);
      if (prev[key] && activeCount <= 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  }, []);

  const changeDuration = useCallback((seconds: number) => {
    setConfig((prev) => ({ ...prev, duration: seconds }));
  }, []);

  const flashKey = useCallback((note: NoteName, ms = 180) => {
    const k = NOTE_TO_KEY[note];
    if (!k) return;
    setPressedKeys((prev) => { const n = new Set(prev); n.add(k); return n; });
    setTimeout(() => {
      setPressedKeys((prev) => { const n = new Set(prev); n.delete(k); return n; });
    }, ms);
  }, []);

  const handlePress = useCallback(
    (note: NoteName) => { playNote(note); flashKey(note); },
    [playNote, flashKey]
  );

  const submitGuess = useCallback(
    (note: NoteName, source: "keyboard" | "mouse") => {
      if (state.phase !== "playing") return;
      if (source === "mouse") { playNote(note); flashKey(note); }

      const correct = state.currentNote
        ? ENHARMONIC_MAP[note] === ENHARMONIC_MAP[state.currentNote]
        : false;

      setLastPoints(correct ? 10 + state.combo * 5 : 0);
      guess(note);

      if (!correct && state.currentNote && !comparisonScheduled.current) {
        comparisonScheduled.current = true;
        const target = state.currentNote;
        setTimeout(() => {
          playNote(target);
          flashKey(target, 400);
          comparisonScheduled.current = false;
        }, 700);
      }
    },
    [state.phase, state.currentNote, state.combo, guess, playNote, flashKey]
  );

  useKeyboard(
    (note) => handlePress(note),
    state.phase === "playing",
    (note) => submitGuess(note, "keyboard"),
    replay
  );

  const pct = Math.max(0, (state.timeLeft / config.duration) * 100);
  const timerColor = state.timeLeft > 20 ? "#e2b714" : state.timeLeft > 10 ? "#f59e0b" : "#ca4754";
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isPlaying = state.phase === "playing" || state.phase === "feedback";

  return (
    <>
      <SideNav />
      <div
        className="md:ml-64 min-h-screen flex flex-col"
        style={{ background: "#232323", color: "#d1d0c5" }}
      >
        {/* ── Top bar ── */}
        <header
          className="fixed top-0 left-0 md:left-64 right-0 z-40 flex items-center justify-between px-6 h-12"
          style={{ background: "#232323", borderBottom: "1px solid #2c2c2c" }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              style={{ color: "#646669", display: "flex", alignItems: "center", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#d1d0c5")}
              onMouseLeave={e => (e.currentTarget.style.color = "#646669")}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
            </Link>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#646669" }}>
              ear trainer
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isLoaded && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#646669" }}>
                loading…
              </span>
            )}
            {isLoaded && isPlaying && (
              <button
                onClick={() => setBlindMode(p => !p)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: blindMode ? "#e2b714" : "#646669",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  padding: "2px 0",
                }}
              >
                {blindMode ? "blind" : "sight"}
              </button>
            )}
            {isLoaded && (
              <button
                onClick={reset}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "#646669",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "#d1d0c5")}
                onMouseLeave={e => (e.currentTarget.style.color = "#646669")}
              >
                reset
              </button>
            )}
          </div>
        </header>

        {/* ── Main ── */}
        <main
          className="flex-1 flex flex-col items-center justify-center pt-12 px-4 pb-6"
          style={{ minHeight: "100vh" }}
        >

          {/* ═══════════════ IDLE / START ═══════════════ */}
          {state.phase === "idle" && (
            <div
              style={{
                width: "100%",
                maxWidth: 480,
                animation: "mtFadeIn 0.25s ease",
              }}
            >
              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: "#646669",
                    letterSpacing: "0.1em",
                    textTransform: "lowercase",
                    marginBottom: 8,
                  }}
                >
                  piano ear trainer
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#e2b714",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  🎹
                </div>
              </div>

              {/* Config rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Notes */}
                <ConfigRow label="notes">
                  {(["practiceNatural", "practiceSharp", "practiceFlat"] as (keyof GameConfig)[]).map((key) => {
                    const labels: Record<string, string> = {
                      practiceNatural: "natural",
                      practiceSharp: "sharp",
                      practiceFlat: "flat",
                    };
                    const active = config[key] as boolean;
                    return (
                      <MtChip
                        key={key}
                        active={active}
                        onClick={() => togglePracticeOption(key)}
                      >
                        {labels[key]}
                      </MtChip>
                    );
                  })}
                </ConfigRow>

                {/* Duration */}
                <ConfigRow label="time">
                  {[30, 60, 120].map((t) => (
                    <MtChip
                      key={t}
                      active={config.duration === t}
                      onClick={() => changeDuration(t)}
                    >
                      {t}s
                    </MtChip>
                  ))}
                </ConfigRow>

                {/* Mode */}
                <ConfigRow label="mode">
                  <MtChip active={blindMode} onClick={() => setBlindMode(p => !p)}>
                    blind
                  </MtChip>
                  <MtChip active={!blindMode} onClick={() => setBlindMode(p => !p)}>
                    sight
                  </MtChip>
                </ConfigRow>

              </div>

              {/* Start hint */}
              <div
                style={{
                  marginTop: 36,
                  textAlign: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: "#646669",
                  lineHeight: 1.8,
                }}
              >
                {isLoaded ? (
                  <>
                    press{" "}
                    <span
                      onClick={start}
                      style={{ color: "#e2b714", cursor: "pointer", borderBottom: "1px solid #e2b71440" }}
                    >
                      tab
                    </span>
                    {" "}or click{" "}
                    <button
                      onClick={start}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: "#e2b714",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        borderBottom: "1px solid #e2b71440",
                      }}
                    >
                      start
                    </button>
                    {" "}to begin
                  </>
                ) : (
                  <span style={{ color: "#646669" }}>loading audio samples…</span>
                )}
              </div>

              {/* Start button */}
              {isLoaded && (
                <button
                  onClick={start}
                  style={{
                    marginTop: 16,
                    width: "100%",
                    padding: "14px",
                    background: "#e2b714",
                    color: "#232323",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  start
                </button>
              )}

              {/* Key hint */}
              <div
                style={{
                  marginTop: 28,
                  padding: "12px 16px",
                  background: "#2c2c2c",
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "#646669",
                  lineHeight: 1.9,
                }}
              >
                <span style={{ color: "#d1d0c5" }}>white keys:</span> A S D F G H J
                &nbsp;&nbsp;
                <span style={{ color: "#d1d0c5" }}>black keys:</span> W E T Y U
                &nbsp;&nbsp;
                <span style={{ color: "#d1d0c5" }}>replay:</span> R
              </div>
            </div>
          )}

          {/* ═══════════════ PLAYING / FEEDBACK ═══════════════ */}
          {isPlaying && (
            <div
              style={{
                width: "100%",
                maxWidth: 720,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
                animation: "mtFadeIn 0.2s ease",
              }}
            >
              {/* ── Stats bar ── */}
              <div
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 0,
                  marginBottom: 8,
                }}
              >
                <MtStat label="wpm" value={String(state.score)} />
                <MtStat label="acc" value={`${accuracy}%`} />
                <MtStat label="combo" value={`${state.combo}×`} highlight={state.combo >= 5} />
                <MtStat label="time" value={timeStr} color={timerColor} pulse={state.timeLeft <= 10} />
              </div>

              {/* ── Timer progress bar ── */}
              <div
                style={{
                  width: "100%",
                  height: 3,
                  background: "#2c2c2c",
                  borderRadius: 2,
                  marginBottom: 40,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: timerColor,
                    transition: "width 1s linear",
                    borderRadius: 2,
                  }}
                />
              </div>

              {/* ── Note Challenge ── */}
              <NoteChallenge
                note={state.currentNote}
                feedback={state.feedback}
                lastGuess={state.lastGuess}
                points={lastPoints}
                combo={state.combo}
                onReplay={replay}
                blindMode={blindMode}
              />

              {/* ── Piano ── */}
              <div style={{ width: "100%", marginTop: 32 }}>
                <PianoKeyboard
                  onGuess={(note) => submitGuess(note, "mouse")}
                  activeKeys={pressedKeys}
                  feedback={state.feedback}
                  lastGuess={state.lastGuess}
                  correctNote={state.currentNote}
                  disabled={state.phase !== "playing"}
                  practiceSharp={config.practiceSharp}
                  practiceFlat={config.practiceFlat}
                />
              </div>

              {/* ── Key legend ── */}
              <div
                style={{
                  marginTop: 14,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: "#646669",
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <span><span style={{ color: "#d1d0c5" }}>white:</span> A S D F G H J</span>
                <span><span style={{ color: "#d1d0c5" }}>black:</span> W E T Y U</span>
                <span><span style={{ color: "#e2b714" }}>replay:</span> R</span>
              </div>
            </div>
          )}

          {/* ═══════════════ ENDED ═══════════════ */}
          {state.phase === "ended" && (
            <SessionStats
              score={state.score}
              accuracy={accuracy}
              maxCombo={state.maxCombo}
              totalAttempts={state.totalAttempts}
              correctAttempts={state.correctAttempts}
              history={state.history}
              onRestart={start}
            />
          )}
        </main>
      </div>
    </>
  );
}

// ─── Monkeytype-style sub-components ─────────────────────────────────────────

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#646669",
          minWidth: 56,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {children}
      </div>
    </div>
  );
}

function MtChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: active ? 700 : 400,
        color: active ? "#e2b714" : "#646669",
        background: active ? "#2c2c2c" : "transparent",
        border: "none",
        borderRadius: 4,
        padding: "4px 10px",
        cursor: "pointer",
        transition: "color 0.15s, background 0.15s",
        outline: active ? "1px solid #e2b71430" : "none",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = "#d1d0c5"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#646669"; }}
    >
      {children}
    </button>
  );
}

function MtStat({
  label,
  value,
  color,
  highlight,
  pulse,
}: {
  label: string;
  value: string;
  color?: string;
  highlight?: boolean;
  pulse?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 4px" }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "#646669",
          letterSpacing: "0.08em",
          textTransform: "lowercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 20,
          fontWeight: 700,
          color: color ?? (highlight ? "#e2b714" : "#d1d0c5"),
          letterSpacing: "-0.02em",
          transition: "color 0.3s",
          animation: pulse ? "timerPulse 0.8s ease infinite" : "none",
        }}
      >
        {value}
      </span>
    </div>
  );
}
