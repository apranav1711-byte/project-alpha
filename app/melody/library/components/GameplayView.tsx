"use client";
import React, { useEffect, useState } from "react";
import type { SongMetadata, SongSegment, LibraryPhase, LibraryNoteAttempt } from "../types";
import { PianoKeyboard } from "../../../training/components/PianoKeyboard";
import SequenceProgress from "../../components/SequenceProgress";
import { LIVES_BY_DIFF } from "../../data/packs";

interface Props {
  song: SongMetadata;
  phase: LibraryPhase;
  score: number;
  combo: number;
  multiplier: number;
  lives: number;
  maxLives: number;
  inputIndex: number;
  attempts: LibraryNoteAttempt[];
  tempoSpeed: number;
  loopSegmentName: string;
  metronomeOn: boolean;
  isPlayingPreview: boolean;
  activePreviewNoteIdx: number | null;
  onStartListening: () => void;
  onReplay: () => void;
  onToggleMetronome: () => void;
  onChangeTempo: (speed: number) => void;
  onChangeLoopSegment: (name: string) => void;
  onExit: () => void;
  onPlayKeyboardNote: (note: string) => void;
  activeKeys: Set<string>;
  practiceHand: "left" | "right" | "both";
  onChangePracticeHand: (hand: "left" | "right" | "both") => void;
}

export default function GameplayView({
  song,
  phase,
  score,
  combo,
  multiplier,
  lives,
  maxLives,
  inputIndex,
  attempts,
  tempoSpeed,
  loopSegmentName,
  metronomeOn,
  isPlayingPreview,
  activePreviewNoteIdx,
  onStartListening,
  onReplay,
  onToggleMetronome,
  onChangeTempo,
  onChangeLoopSegment,
  onExit,
  onPlayKeyboardNote,
  activeKeys,
  practiceHand,
  onChangePracticeHand,
}: Props) {
  // Visual Metronome Flash Trigger
  const [pulse, setPulse] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Filter notes based on selected hand
  const activeNotes = React.useMemo(() => {
    if (practiceHand === "both") return song.notes;
    return song.notes.filter((n) => n.hand === practiceHand);
  }, [song.notes, practiceHand]);

  useEffect(() => {
    if (!metronomeOn || !isPlayingPreview) return;
    const intervalTime = (60 / (song.bpm * tempoSpeed)) * 1000;
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 80);
    }, intervalTime);

    return () => clearInterval(id);
  }, [metronomeOn, isPlayingPreview, song.bpm, tempoSpeed]);

  const progressPercent = Math.min(100, Math.round((inputIndex / song.notes.length) * 100));
  const healthPercent = Math.round((lives / maxLives) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeInUp 0.3s ease forwards" }}>
      {/* HUD Bar */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={onExit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </button>
          <div>
            <h2 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
              {song.title}
            </h2>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
              {song.artist} · {song.genre}
            </p>
          </div>
        </div>



        {/* Score & Multiplier */}
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em" }}>SCORE</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>{score.toLocaleString()}</div>
          </div>

          <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>COMBO:</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: combo > 0 ? "var(--correct)" : "var(--text-muted)" }}>{combo}</div>
            {multiplier > 1 && (
              <div style={{ fontSize: 11, padding: "2px 6px", background: "var(--accent-sub)", color: "var(--accent)", borderRadius: 4, fontWeight: 700 }}>
                ×{multiplier}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Board Block */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "32px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Visual Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: isPlayingPreview
              ? "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(91,164,207,0.06), transparent)"
              : "radial-gradient(ellipse 60% 60% at 50% 50%, var(--accent-sub), transparent)",
          }}
        />

        {/* Metronome Beat Pulse Visualizer */}
        {metronomeOn && isPlayingPreview && (
          <div
            style={{
              position: "absolute",
              right: 24,
              top: 24,
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
              opacity: pulse ? 1 : 0.25,
              boxShadow: pulse ? "0 0 12px var(--accent)" : "none",
              transition: "opacity 0.08s ease, box-shadow 0.08s ease",
            }}
          />
        )}

        {/* Phase Header */}
        {phase === "idle" && (
          <div style={{ position: "relative", zIndex: 1, padding: "20px 0" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 44, color: "var(--accent)", marginBottom: 12 }}>
              music_note
            </span>
            <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              Ready to Practice?
            </h3>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              Adjust loop segment and tempo speed below, then hit Start Session!
            </p>
            <button
              onClick={onStartListening}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                padding: "12px 32px",
                background: "var(--accent)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                transition: "opacity 0.15s",
              }}
            >
              Start Session
            </button>
          </div>
        )}

        {phase === "listening" && (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "#5ba4cf", animation: "timerPulse 1s infinite" }}>
                hearing
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                Listen Carefully
              </span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-sub)", marginBottom: 20 }}>
              Synthesizing track... Note index highlights as song plays
            </p>

            {/* Note Sequence indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: 4, height: 40, marginBottom: 16, alignItems: "flex-end" }}>
              {activeNotes.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: activePreviewNoteIdx === i ? 36 : 14,
                    background: activePreviewNoteIdx === i ? "var(--accent)" : activePreviewNoteIdx !== null && i < activePreviewNoteIdx ? "#5ba4cf" : "var(--bg-raised)",
                    borderRadius: 3,
                    transition: "all 0.1s ease",
                  }}
                />
              ))}
            </div>

            {/* Scrolling note bubbles in Learn Mode */}
            {showNotes && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: "12px 18px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 10, maxWidth: "100%", maxHeight: 100, overflowY: "auto", animation: "fadeInUp 0.25s ease" }}>
                  {activeNotes.map((n, i) => {
                    const isCurrent = i === activePreviewNoteIdx;
                    const isPlayed = activePreviewNoteIdx !== null && i < activePreviewNoteIdx;
                    const isRight = n.hand === "right";
                    let bg = "var(--bg-raised)";
                    let color = "var(--text-sub)";
                    let border = "1px solid var(--bg-border)";
                    
                    if (isCurrent) {
                      bg = isRight ? "#5ba4cf" : "#ff7a50";
                      color = "var(--bg)";
                      border = `1px solid ${isRight ? "#5ba4cf" : "#ff7a50"}`;
                    } else if (isPlayed) {
                      bg = isRight ? "rgba(91, 164, 207, 0.03)" : "rgba(255, 122, 80, 0.03)";
                      color = isRight ? "rgba(91, 164, 207, 0.3)" : "rgba(255, 122, 80, 0.3)";
                      border = `1px solid ${isRight ? "rgba(91, 164, 207, 0.1)" : "rgba(255, 122, 80, 0.1)"}`;
                    } else {
                      bg = isRight ? "rgba(91, 164, 207, 0.08)" : "rgba(255, 122, 80, 0.08)";
                      color = isRight ? "#5ba4cf" : "#ff7a50";
                      border = `1px solid ${isRight ? "rgba(91, 164, 207, 0.2)" : "rgba(255, 122, 80, 0.2)"}`;
                    }

                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          padding: "4px 8px",
                          background: bg,
                          color,
                          border,
                          borderRadius: 6,
                          fontWeight: isCurrent ? "bold" : "normal",
                          transition: "all 0.15s",
                        }}
                      >
                        {n.note}
                      </span>
                    );
                  })}
                </div>
                {practiceHand === "both" && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", animation: "fadeInUp 0.25s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5ba4cf" }} />
                      <span>Right Hand (Treble)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff7a50" }} />
                      <span>Left Hand (Bass)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {phase === "inputting" && (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--accent)" }}>
                piano
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                Reproduce the Melody
              </span>
            </div>

            {/* Blind mode progress dots */}
            <SequenceProgress
              total={activeNotes.length}
              attempts={attempts.map((a) => ({
                index: a.index,
                expected: a.expected,
                played: a.played,
                correct: a.correct,
                timingOffsetMs: a.timeOffsetMs,
                timingScore: a.timingScore,
              }))}
              currentIndex={inputIndex}
              phase={phase}
            />

            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>
              note {Math.min(inputIndex + 1, activeNotes.length)} / {activeNotes.length} · press R to replay sequence
            </div>

            {/* Scrolling note bubbles in Learn Mode */}
            {showNotes && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", padding: "12px 18px", background: "var(--bg-surface)", border: "1px solid var(--bg-border)", borderRadius: 10, maxWidth: "100%", maxHeight: 100, overflowY: "auto", animation: "fadeInUp 0.25s ease" }}>
                  {activeNotes.map((n, i) => {
                    const isCurrent = i === inputIndex;
                    const isPlayed = i < inputIndex;
                    const isRight = n.hand === "right";
                    let bg = "var(--bg-raised)";
                    let color = "var(--text-sub)";
                    let border = "1px solid var(--bg-border)";
                    
                    if (isCurrent) {
                      bg = isRight ? "#5ba4cf" : "#ff7a50";
                      color = "var(--bg)";
                      border = `1px solid ${isRight ? "#5ba4cf" : "#ff7a50"}`;
                    } else if (isPlayed) {
                      bg = isRight ? "rgba(91, 164, 207, 0.03)" : "rgba(255, 122, 80, 0.03)";
                      color = isRight ? "rgba(91, 164, 207, 0.3)" : "rgba(255, 122, 80, 0.3)";
                      border = `1px solid ${isRight ? "rgba(91, 164, 207, 0.1)" : "rgba(255, 122, 80, 0.1)"}`;
                    } else {
                      bg = isRight ? "rgba(91, 164, 207, 0.08)" : "rgba(255, 122, 80, 0.08)";
                      color = isRight ? "#5ba4cf" : "#ff7a50";
                      border = `1px solid ${isRight ? "rgba(91, 164, 207, 0.2)" : "rgba(255, 122, 80, 0.2)"}`;
                    }

                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 11,
                          padding: "4px 8px",
                          background: bg,
                          color,
                          border,
                          borderRadius: 6,
                          fontWeight: isCurrent ? "bold" : "normal",
                          transition: "all 0.15s",
                        }}
                      >
                        {n.note}
                      </span>
                    );
                  })}
                </div>
                {practiceHand === "both" && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", animation: "fadeInUp 0.25s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#5ba4cf" }} />
                      <span>Right Hand (Treble)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff7a50" }} />
                      <span>Left Hand (Bass)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adjustments Dock */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
        }}
      >
        {/* Practice Hand tab */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            PRACTICE HAND
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "right", label: "Right Hand (Treble)", icon: "pan_tool" },
              { id: "left", label: "Left Hand (Bass)", icon: "pan_tool" },
              { id: "both", label: "Both Hands (Combined)", icon: "front_hand" },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => onChangePracticeHand(h.id as any)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: practiceHand === h.id ? "var(--accent-sub)" : "var(--bg-raised)",
                  color: practiceHand === h.id ? "var(--accent)" : "var(--text-sub)",
                  border: `1px solid ${practiceHand === h.id ? "var(--accent)" : "var(--bg-border)"}`,
                  transition: "all 0.15s",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{h.icon}</span>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loop segmenting practice */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            SEGMENTED PRACTICE LOOP
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {song.segments.map((seg) => (
              <button
                key={seg.name}
                onClick={() => onChangeLoopSegment(seg.name)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  background: loopSegmentName === seg.name ? "var(--accent-sub)" : "var(--bg-raised)",
                  color: loopSegmentName === seg.name ? "var(--accent)" : "var(--text-sub)",
                  border: `1px solid ${loopSegmentName === seg.name ? "var(--accent)" : "var(--bg-border)"}`,
                }}
              >
                {seg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Slow Mode slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
            <span>TEMPO SPEED:</span>
            <span style={{ color: "var(--accent)" }}>{tempoSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={tempoSpeed}
            onChange={(e) => onChangeTempo(parseFloat(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent)" }}
          />
        </div>

        {/* Metronome & Replay triggers */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowNotes(prev => !prev)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: "8px 16px",
              background: showNotes ? "var(--accent-sub)" : "var(--bg-raised)",
              color: showNotes ? "var(--accent)" : "var(--text-sub)",
              border: `1px solid ${showNotes ? "var(--accent)" : "var(--bg-border)"}`,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
            {showNotes ? "Hide Notes" : "Learn Mode (Show Notes)"}
          </button>

          <button
            onClick={onToggleMetronome}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: "8px 16px",
              background: metronomeOn ? "var(--accent-sub)" : "var(--bg-raised)",
              color: metronomeOn ? "var(--accent)" : "var(--text-sub)",
              border: `1px solid ${metronomeOn ? "var(--accent)" : "var(--bg-border)"}`,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
            Metronome
          </button>

          <button
            onClick={onReplay}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: "8px 16px",
              background: "var(--bg-raised)",
              color: "var(--text-sub)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>replay</span>
            Replay [R]
          </button>
        </div>
      </div>

      {/* Premium virtual Piano */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <PianoKeyboard
          onGuess={onPlayKeyboardNote}
          activeKeys={activeKeys}
          feedback={null}
          lastGuess={null}
          correctNote={null}
          disabled={phase !== "inputting" && phase !== "listening"}
          practiceSharp
          practiceFlat
        />
        <div style={{ marginTop: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "var(--text-muted)", textAlign: "left" }}>
          keyboard: A S D F G H J (naturals) · W E T Y U (sharps) · clicks sound note and interrupts listening
        </div>
      </div>
    </div>
  );
}
