"use client";
import { NOTE_TO_KEY, NOTE_DISPLAY, ENHARMONIC_MAP, type NoteName, type FeedbackKind } from "../types";

interface Props {
  onGuess: (note: NoteName) => void;
  activeKeys: Set<string>;
  feedback: FeedbackKind | null;
  lastGuess: NoteName | null;
  correctNote: NoteName | null;
  disabled: boolean;
  practiceSharp?: boolean;
  practiceFlat?: boolean;
}

const WHITE: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

const BLACK_INFO: { note: NoteName; leftFrac: number }[] = [
  { note: "C#", leftFrac: 1 / 7 - 0.04 / 2 },
  { note: "D#", leftFrac: 2 / 7 - 0.04 / 2 },
  { note: "F#", leftFrac: 4 / 7 - 0.04 / 2 },
  { note: "G#", leftFrac: 5 / 7 - 0.04 / 2 },
  { note: "A#", leftFrac: 6 / 7 - 0.04 / 2 },
];

const BLACK_LEFT_PCT: Record<NoteName, number> = {
  "C#": (1 / 7) * 100 - 4, Db: (1 / 7) * 100 - 4,
  "D#": (2 / 7) * 100 - 4, Eb: (2 / 7) * 100 - 4,
  "F#": (4 / 7) * 100 - 4, Gb: (4 / 7) * 100 - 4,
  "G#": (5 / 7) * 100 - 4, Ab: (5 / 7) * 100 - 4,
  "A#": (6 / 7) * 100 - 4, Bb: (6 / 7) * 100 - 4,
  C: 0, D: 0, E: 0, F: 0, G: 0, A: 0, B: 0,
};

const BLACK_FLAT_MAP: Record<NoteName, NoteName> = {
  "C#": "Db", Db: "Db", "D#": "Eb", Eb: "Eb",
  "F#": "Gb", Gb: "Gb", "G#": "Ab", Ab: "Ab",
  "A#": "Bb", Bb: "Bb",
  C: "C", D: "D", E: "E", F: "F", G: "G", A: "A", B: "B",
};

function getBlackLabel(note: NoteName, practiceSharp = true, practiceFlat = false): string {
  const sharp = NOTE_DISPLAY[note];
  const flatNote = BLACK_FLAT_MAP[note];
  const flat = flatNote ? NOTE_DISPLAY[flatNote] : "";
  if (practiceSharp && practiceFlat) return `${sharp}\n${flat}`;
  if (practiceFlat) return flat || sharp;
  return sharp;
}

function getWhiteStyle(
  note: NoteName,
  feedback: FeedbackKind | null,
  lastGuess: NoteName | null,
  correctNote: NoteName | null,
  kbActive: boolean
): React.CSSProperties {
  const isGuessed = lastGuess ? ENHARMONIC_MAP[lastGuess] === ENHARMONIC_MAP[note] : false;
  const isCorrect = correctNote ? ENHARMONIC_MAP[correctNote] === ENHARMONIC_MAP[note] : false;

  if (kbActive) return { background: "#e2b714", color: "#232323", transform: "translateY(2px)" };

  if (feedback) {
    if (isGuessed && feedback === "correct")
      return { background: "#4ade80", color: "#14532d", transform: "translateY(2px)" };
    if (isGuessed && feedback === "wrong")
      return { background: "#ca4754", color: "#fff" };
    if (!isGuessed && isCorrect && feedback === "wrong")
      return { background: "#4ade80", color: "#14532d" };
  }
  return {};
}

function getBlackStyle(
  note: NoteName,
  feedback: FeedbackKind | null,
  lastGuess: NoteName | null,
  correctNote: NoteName | null,
  kbActive: boolean
): React.CSSProperties {
  const isGuessed = lastGuess ? ENHARMONIC_MAP[lastGuess] === ENHARMONIC_MAP[note] : false;
  const isCorrect = correctNote ? ENHARMONIC_MAP[correctNote] === ENHARMONIC_MAP[note] : false;

  if (kbActive) return { background: "#e2b714", color: "#232323", transform: "translateY(2px)" };

  if (feedback) {
    if (isGuessed && feedback === "correct")
      return { background: "#4ade80", color: "#14532d", transform: "translateY(2px)" };
    if (isGuessed && feedback === "wrong")
      return { background: "#ca4754", color: "#fff" };
    if (!isGuessed && isCorrect && feedback === "wrong")
      return { background: "#4ade80", color: "#14532d" };
  }
  return {};
}

export function PianoKeyboard({
  onGuess,
  activeKeys,
  feedback,
  lastGuess,
  correctNote,
  disabled,
  practiceSharp = true,
  practiceFlat = false,
}: Props) {
  const handleKey = (note: NoteName) => {
    if (disabled) return;
    onGuess(note);
  };

  return (
    <div
      style={{
        width: "100%",
        height: 200,
        position: "relative",
        userSelect: "none",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #2c2c2c",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      {/* White keys */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        {WHITE.map((note) => {
          const kbKey = NOTE_TO_KEY[note];
          const kbActive = activeKeys.has(kbKey);
          const extra = getWhiteStyle(note, feedback, lastGuess, correctNote, kbActive);
          return (
            <button
              key={note}
              onMouseDown={() => handleKey(note)}
              disabled={disabled}
              aria-label={`${NOTE_DISPLAY[note]} key`}
              style={{
                flex: 1,
                height: "100%",
                background: "#e8e8e8",
                color: "#646669",
                borderRight: "1px solid #c0c0c0",
                borderBottom: "none",
                borderTop: "none",
                borderLeft: "none",
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.07s ease",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 10,
                gap: 2,
                fontFamily: "'JetBrains Mono', monospace",
                ...extra,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{kbKey}</span>
              <span style={{ fontSize: 9, opacity: 0.5 }}>{NOTE_DISPLAY[note]}</span>
            </button>
          );
        })}
      </div>

      {/* Black keys */}
      {BLACK_INFO.map(({ note }) => {
        const kbKey = NOTE_TO_KEY[note];
        const kbActive = activeKeys.has(kbKey);
        const extra = getBlackStyle(note, feedback, lastGuess, correctNote, kbActive);
        const leftPct = BLACK_LEFT_PCT[note];
        const label = getBlackLabel(note, practiceSharp, practiceFlat);

        return (
          <button
            key={note}
            onMouseDown={() => handleKey(note)}
            disabled={disabled}
            aria-label={`${NOTE_DISPLAY[note]} key`}
            style={{
              position: "absolute",
              top: 0,
              left: `${leftPct}%`,
              width: "7.5%",
              height: "60%",
              background: "#1a1a1a",
              color: "#646669",
              border: "none",
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              zIndex: 10,
              cursor: disabled ? "default" : "pointer",
              transition: "all 0.07s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingBottom: 8,
              gap: 1,
              boxShadow: "0 4px 8px rgba(0,0,0,0.6), inset 0 -2px 0 rgba(0,0,0,0.3)",
              fontFamily: "'JetBrains Mono', monospace",
              ...extra,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.6 }}>{kbKey}</span>
            {label.split("\n").map((l, i) => (
              <span key={i} style={{ fontSize: 7, opacity: 0.5, lineHeight: 1.2 }}>{l}</span>
            ))}
          </button>
        );
      })}
    </div>
  );
}
