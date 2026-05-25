"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import SideNav from "../components/SideNav";
import TopNav from "../components/TopNav";
import { useMelodyEngine } from "./hooks/useMelodyEngine";
import { useAudio } from "../training/hooks/useAudio";
import { useKeyboard } from "../training/hooks/useKeyboard";
import { PianoKeyboard } from "../training/components/PianoKeyboard";
import { NOTE_DISPLAY } from "../training/types";
import CountdownOverlay from "./components/CountdownOverlay";
import MelodyHUD from "./components/MelodyHUD";
import SequenceProgress from "./components/SequenceProgress";
import ResultView from "./components/ResultView";
import SessionEndView from "./components/SessionEndView";
import { MELODY_PACKS, totalDurationMs } from "./data/packs";
import type { Melody, NoteName } from "./types";

// ── Helper: play a melody with setTimeout chain ──────────────────────────────
function scheduleMelody(
  melody: Melody,
  playNote: (n: NoteName) => void,
  onNoteIndex: (i: number | null) => void,
  onComplete: () => void,
  speedMult = 1
): () => void {
  const msPerBeat = 60_000 / melody.bpm / speedMult;
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let t = 0;

  melody.notes.forEach((mn, i) => {
    t += mn.gap * msPerBeat;
    const noteStart = t;
    const noteDur = mn.beats * msPerBeat;
    timeouts.push(
      setTimeout(() => {
        playNote(mn.note);
        onNoteIndex(i);
        setTimeout(() => onNoteIndex(null), noteDur * 0.85);
      }, noteStart)
    );
    t += noteDur;
  });

  // Fire onComplete slightly after last note finishes
  timeouts.push(setTimeout(onComplete, t + 400));

  return () => timeouts.forEach(clearTimeout);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MelodyModePage() {
  const engine = useMelodyEngine();
  const audio = useAudio();
  const { state, currentPack, currentMelody } = engine;

  // Keyboard active keys visual
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  // Listening phase: which note is currently playing (index, for progress)
  const [listeningNoteIdx, setListeningNoteIdx] = useState<number | null>(null);

  // Cancel ref for scheduled melody
  const cancelMelodyRef = useRef<(() => void) | null>(null);

  // ── Flash a key visually ───────────────────────────────────────────────────
  const flashKey = useCallback((note: string, dur = 200) => {
    setActiveKeys((prev) => new Set([...prev, note]));
    setTimeout(() => setActiveKeys((prev) => { const s = new Set(prev); s.delete(note); return s; }), dur);
  }, []);

  // Hint state for showing the first note
  const [hintTaken, setHintTaken] = useState(false);

  // Reset hint when round transitions to listening
  useEffect(() => {
    if (state.phase === "listening") {
      setHintTaken(false);
    }
  }, [state.phase]);

  // Take a hint (plays first note and flashes key)
  const takeHint = useCallback(() => {
    if (!currentMelody || state.inputIndex !== 0) return;
    setHintTaken(true);

    const firstNote = currentMelody.notes[0].note;
    audio.playNote(firstNote);

    const keyMap: Record<string, string> = {
      C: "A", "C#": "W", Db: "W", D: "S", "D#": "E", Eb: "E", E: "D",
      F: "F", "F#": "T", Gb: "T", G: "G", "G#": "Y", Ab: "Y",
      A: "H", "A#": "U", Bb: "U", B: "J",
    };
    const k = keyMap[firstNote];
    if (k) flashKey(k, 800);
  }, [currentMelody, state.inputIndex, audio, flashKey]);

  // ── Handle note input during inputting phase ───────────────────────────────
  const handleNoteInput = useCallback(
    (note: NoteName) => {
      if (state.phase !== "inputting" && state.phase !== "listening") return;
      if (state.phase === "listening") {
        cancelMelodyRef.current?.();
      }
      engine.submitNote(note, Date.now());
    },
    [state.phase, engine]
  );

  // ── Keyboard handler ───────────────────────────────────────────────────────
  useKeyboard(
    (note) => {
      audio.playNote(note);
      // Map NoteName to key string for visual flash
      const keyMap: Record<string, string> = {
        C: "A", "C#": "W", Db: "W", D: "S", "D#": "E", Eb: "E", E: "D",
        F: "F", "F#": "T", Gb: "T", G: "G", "G#": "Y", Ab: "Y",
        A: "H", "A#": "U", Bb: "U", B: "J",
      };
      const k = keyMap[note];
      if (k) flashKey(k, 200);
    },
    state.phase === "inputting" || state.phase === "listening",
    handleNoteInput,
    () => {
      if (
        state.phase === "inputting" ||
        state.phase === "listening" ||
        state.phase === "result"
      ) {
        cancelMelodyRef.current?.();
        engine.replayMelody();
      }
    }
  );

  // ── Countdown effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "countdown") return;
    const id = setInterval(engine.tickCountdown, 1000);
    return () => clearInterval(id);
  }, [state.phase, engine.tickCountdown]);

  // ── Listening phase: play melody ──────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== "listening" || !currentMelody) return;
    // Cancel any previous playback
    cancelMelodyRef.current?.();
    setListeningNoteIdx(null);

    const speedMult = state.slowMode ? 0.5 : 1;
    const cancel = scheduleMelody(
      currentMelody,
      audio.playNote,
      setListeningNoteIdx,
      engine.onListeningComplete,
      speedMult
    );
    cancelMelodyRef.current = cancel;

    return () => {
      cancel();
      setListeningNoteIdx(null);
    };
  }, [state.phase, currentMelody, state.slowMode, state.replayTrigger]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelMelodyRef.current?.();
    };
  }, []);

  // ── Current round result (last item in history) ────────────────────────────
  const lastResult = state.roundResults[state.roundResults.length - 1] ?? null;

  // ── Adaptive difficulty suggestion ────────────────────────────────────────
  const avgRecentAcc =
    state.roundResults.length >= 2
      ? Math.round(state.roundResults.slice(-3).reduce((t, r) => t + r.noteAccuracy, 0) /
          Math.min(state.roundResults.length, 3))
      : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <TopNav />
      <SideNav />

      {/* Countdown overlay */}
      {state.phase === "countdown" && (
        <CountdownOverlay value={state.countdown} />
      )}

      <main
        className="md:ml-64"
        style={{
          paddingTop: 72,
          paddingBottom: 48,
          paddingLeft: 40,
          paddingRight: 40,
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {/* ── IDLE / PACK SELECTOR ── */}
        {state.phase === "idle" && (
          <div style={{ animation: "fadeInUp 0.35s ease forwards" }}>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                blind melody mode
              </div>
              <h1 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 10 }}>
                Listen. Remember. Reproduce.
              </h1>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "var(--text-sub)", maxWidth: 540 }}>
                A melody plays — no visual hints. Reproduce every note in the exact order.
                Timing, accuracy, and combo all matter.
              </p>
            </div>

            {/* How to play */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                padding: "18px 22px",
                marginBottom: 32,
                display: "flex",
                gap: 28,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: "hearing", label: "Listen", desc: "Melody plays with no key hints" },
                { icon: "piano", label: "Reproduce", desc: "Play back the exact sequence" },
                { icon: "grade", label: "Score", desc: "Accuracy + timing + combos" },
                { icon: "lock_open", label: "Unlock", desc: "Hit accuracy thresholds to unlock harder packs" },
              ].map((tip) => (
                <div key={tip.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, minWidth: 160 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{tip.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pack selector */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 16 }}>
              SELECT PACK
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
              {MELODY_PACKS.map((pack) => {
                const isUnlocked = state.unlockedPacks.includes(pack.id);
                const isSelected = state.packId === pack.id;

                return (
                  <button
                    key={pack.id}
                    onClick={() => isUnlocked && engine.selectPack(pack.id)}
                    disabled={!isUnlocked}
                    style={{
                      background: isSelected ? "var(--accent-sub)" : "var(--bg-surface)",
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--bg-border)"}`,
                      borderRadius: 10,
                      padding: "20px 20px",
                      textAlign: "left",
                      cursor: isUnlocked ? "pointer" : "not-allowed",
                      opacity: isUnlocked ? 1 : 0.4,
                      transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => { if (isUnlocked && !isSelected) { e.currentTarget.style.borderColor = pack.color; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = isSelected ? "var(--accent)" : "var(--bg-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: i < pack.difficulty ? pack.color : "var(--bg-raised)",
                            }}
                          />
                        ))}
                      </div>
                      {!isUnlocked && (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--text-muted)" }}>lock</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: isSelected ? "var(--accent)" : "var(--text)", marginBottom: 4 }}>
                      {pack.name}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
                      {pack.description}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                      {pack.melodies.length} melodies
                      {!isUnlocked && ` · need ${pack.unlockAccuracy}% avg`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Start button */}
            {state.packId && (
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={engine.startCountdown}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    padding: "14px 36px",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "opacity 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>play_arrow</span>
                  start session
                </button>

                {/* Slow mode toggle */}
                <button
                  onClick={engine.toggleSlowMode}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    padding: "12px 20px",
                    background: state.slowMode ? "var(--accent-sub)" : "var(--bg-surface)",
                    border: `1px solid ${state.slowMode ? "var(--accent)" : "var(--bg-border)"}`,
                    color: state.slowMode ? "var(--accent)" : "var(--text-sub)",
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>slow_motion_video</span>
                  {state.slowMode ? "slow mode ON (0.5×)" : "slow mode"}
                </button>

                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                  or press R to replay · keyboard: A-J + W/E/T/Y/U
                </span>
              </div>
            )}

            {!audio.isLoaded && (
              <div style={{ marginTop: 20, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, animation: "timerPulse 1s infinite" }}>hourglass_empty</span>
                loading piano samples...
              </div>
            )}
          </div>
        )}

        {/* ── LISTENING / INPUTTING ── */}
        {(state.phase === "listening" || state.phase === "inputting" || state.phase === "countdown") && currentMelody && currentPack && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: state.phase === "countdown" ? "none" : "fadeInUp 0.3s ease forwards" }}>
            {/* HUD */}
            <MelodyHUD
              score={state.score}
              lives={state.lives}
              maxLives={state.maxLives}
              combo={state.combo}
              multiplier={state.multiplier}
              melodyName={currentMelody.name}
              melodyIndex={state.melodyIndex}
              totalMelodies={currentPack.melodies.length}
            />

            {/* Phase indicator */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                padding: "28px 24px",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Background glow based on phase */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: state.phase === "listening"
                  ? "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(91,164,207,0.06), transparent)"
                  : "radial-gradient(ellipse 60% 60% at 50% 50%, var(--accent-sub), transparent)",
              }} />

              {state.phase === "listening" && (
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#5ba4cf" }}>hearing</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                      listen carefully
                    </span>
                    {state.slowMode && (
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", padding: "3px 8px", background: "var(--bg-raised)", borderRadius: 4 }}>
                        0.5×
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                    {currentMelody.notes.length} notes · {currentMelody.bpm} BPM · {currentPack.name}
                  </div>
                  {/* Waveform bars animation */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, height: 48, marginBottom: 16 }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 5,
                          borderRadius: 3,
                          background: i === listeningNoteIdx
                            ? "var(--accent)"
                            : (listeningNoteIdx !== null && i < listeningNoteIdx)
                              ? "#5ba4cf"
                              : "var(--bg-raised)",
                          animation: `waveBar${(i % 5) + 1} ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate`,
                          height: `${25 + (i % 5) * 12}px`,
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  {/* Note position counter */}
                  {listeningNoteIdx !== null && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)" }}>
                      note {listeningNoteIdx + 1} / {currentMelody.notes.length}
                    </div>
                  )}
                </div>
              )}

              {state.phase === "inputting" && (
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--accent)" }}>piano</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                      reproduce the melody
                    </span>
                  </div>

                  {/* Adaptive hint */}
                  {avgRecentAcc !== null && (
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: avgRecentAcc >= 80 ? "var(--correct)" : "var(--wrong)", marginBottom: 12 }}>
                      {avgRecentAcc >= 85 ? "🔥 you're on fire — excellent accuracy" : avgRecentAcc < 50 ? "💡 tip: listen 2× before playing back" : ""}
                    </div>
                  )}

                  {/* Sequence progress dots */}
                  <SequenceProgress
                    total={currentMelody.notes.length}
                    attempts={state.attempts}
                    currentIndex={state.inputIndex}
                    phase={state.phase}
                  />

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 14 }}>
                    note {Math.min(state.inputIndex + 1, currentMelody.notes.length)} / {currentMelody.notes.length}
                    &nbsp;·&nbsp;press R to hear melody again
                  </div>

                  {state.inputIndex === 0 && (
                    <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                      {!hintTaken ? (
                        <button
                          onClick={takeHint}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 12,
                            padding: "8px 16px",
                            background: "rgba(226, 183, 20, 0.12)",
                            border: "1px solid var(--accent)",
                            color: "var(--accent)",
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(226, 183, 20, 0.22)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(226, 183, 20, 0.12)"; }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lightbulb</span>
                          get first note hint
                        </button>
                      ) : (
                        <div
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 13,
                            color: "var(--accent)",
                            background: "rgba(226, 183, 20, 0.08)",
                            border: "1px solid rgba(226, 183, 20, 0.3)",
                            padding: "8px 16px",
                            borderRadius: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            animation: "fadeInUp 0.2s ease forwards",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--accent)" }}>lightbulb</span>
                          <span>First note: <strong>{NOTE_DISPLAY[currentMelody.notes[0].note]}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Piano */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--bg-border)",
                borderRadius: 10,
                padding: 20,
              }}
            >
              <PianoKeyboard
                onGuess={(note) => {
                  if (state.phase === "inputting" || state.phase === "listening") {
                    audio.playNote(note);
                    handleNoteInput(note);
                  }
                }}
                activeKeys={activeKeys}
                feedback={null}
                lastGuess={null}
                correctNote={null}
                disabled={state.phase !== "inputting" && state.phase !== "listening"}
                practiceSharp
                practiceFlat
              />
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                  {state.phase === "listening" ? "🔇 no visual hints — use your ears" : "click keys or use keyboard · A S D F G H J · W E T Y U"}
                </span>
                <button
                  onClick={() => {
                    cancelMelodyRef.current?.();
                    engine.replayMelody();
                  }}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    padding: "7px 14px",
                    background: "var(--bg-raised)",
                    border: "1px solid var(--bg-border)",
                    color: "var(--text-muted)",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--bg-border)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>replay</span>
                  replay [R]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {state.phase === "result" && lastResult && currentPack && (
          <ResultView
            result={lastResult}
            onReplay={() => {
              cancelMelodyRef.current?.();
              engine.replayMelody();
            }}
            onNext={engine.nextRound}
            isLast={state.melodyIndex >= currentPack.melodies.length - 1}
          />
        )}

        {/* ── SESSION END ── */}
        {state.phase === "session_end" && currentPack && (
          <SessionEndView
            pack={currentPack}
            roundResults={state.roundResults}
            totalScore={state.score}
            sessionAccuracy={engine.sessionAccuracy}
            sessionTimingAccuracy={engine.sessionTimingAccuracy}
            maxCombo={state.maxCombo}
            newlyUnlocked={state.newlyUnlocked}
            onPlayAgain={engine.reset}
          />
        )}
      </main>

      {/* Waveform bar animation keyframes */}
      <style>{`
        @keyframes waveBar1 { from { height: 10px; } to { height: 40px; } }
        @keyframes waveBar2 { from { height: 15px; } to { height: 30px; } }
        @keyframes waveBar3 { from { height: 8px;  } to { height: 44px; } }
        @keyframes waveBar4 { from { height: 20px; } to { height: 28px; } }
        @keyframes waveBar5 { from { height: 12px; } to { height: 36px; } }
      `}</style>
    </>
  );
}
