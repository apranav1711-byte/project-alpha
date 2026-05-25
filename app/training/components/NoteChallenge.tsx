"use client";
import { NOTE_DISPLAY, type NoteName, type FeedbackKind } from "../types";

interface Props {
  note: NoteName | null;
  feedback: FeedbackKind | null;
  lastGuess: NoteName | null;
  points: number;
  combo: number;
  onReplay: () => void;
  blindMode: boolean;
}

export function NoteChallenge({
  note,
  feedback,
  lastGuess,
  points,
  combo,
  onReplay,
  blindMode,
}: Props) {
  const isWaiting = blindMode && !feedback;
  const noteDisplay = note ? NOTE_DISPLAY[note] : "?";
  const guessDisplay = lastGuess ? NOTE_DISPLAY[lastGuess] : "?";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        minHeight: 160,
      }}
    >
      {/* Sub-label */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color:
            feedback === "correct"
              ? "#4ade80"
              : feedback === "wrong"
              ? "#ca4754"
              : "#646669",
          letterSpacing: "0.08em",
          transition: "color 0.2s",
          minHeight: 18,
        }}
      >
        {feedback === "correct"
          ? combo >= 3
            ? `${combo}× combo`
            : "correct"
          : feedback === "wrong"
          ? "incorrect"
          : isWaiting
          ? "identify by ear"
          : "identify this note"}
      </div>

      {/* Main note display */}
      <div
        key={`${note}-${feedback}`}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color:
            feedback === "correct"
              ? "#4ade80"
              : feedback === "wrong"
              ? "#ca4754"
              : isWaiting
              ? "#e2b714"
              : "#d1d0c5",
          transition: "color 0.2s",
          animation:
            feedback === "correct"
              ? "correctPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both"
              : feedback === "wrong"
              ? "wrongShake 0.35s ease both"
              : "none",
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          userSelect: "none",
        }}
      >
        {feedback === "wrong" ? (
          <>
            <span style={{ color: "#ca4754", opacity: 0.5, fontSize: 64 }}>{guessDisplay}</span>
            <span style={{ color: "#3c3c3c", fontSize: 40, fontWeight: 400 }}>→</span>
            <span style={{ color: "#4ade80" }}>{noteDisplay}</span>
          </>
        ) : isWaiting ? (
          <span>?</span>
        ) : (
          <span>{noteDisplay}</span>
        )}
      </div>

      {/* Points */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color:
            feedback === "correct"
              ? "#4ade80"
              : feedback === "wrong"
              ? "#ca4754"
              : "transparent",
          transition: "color 0.2s",
          minHeight: 20,
        }}
      >
        {feedback === "correct" && points > 0 && `+${points}`}
        {feedback === "wrong" && lastGuess && `you played ${guessDisplay}`}
      </div>

      {/* Replay button */}
      <button
        onClick={onReplay}
        style={{
          marginTop: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#646669",
          background: "none",
          border: "none",
          cursor: "pointer",
          transition: "color 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 0",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#e2b714")}
        onMouseLeave={e => (e.currentTarget.style.color = "#646669")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>replay</span>
        replay [r]
      </button>
    </div>
  );
}
