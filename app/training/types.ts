// ─── Note & Game Types ────────────────────────────────────────────────────────

export type NoteName =
  | "C" | "C#" | "Db" | "D" | "D#" | "Eb" | "E"
  | "F" | "F#" | "Gb" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B";

export const NATURAL_NOTES: NoteName[] = ["C","D","E","F","G","A","B"];
export const SHARP_NOTES: NoteName[] = ["C#","D#","F#","G#","A#"];
export const FLAT_NOTES: NoteName[] = ["Db","Eb","Gb","Ab","Bb"];

export const NOTE_DISPLAY: Record<NoteName, string> = {
  C: "C",
  "C#": "C♯",
  Db: "D♭",
  D: "D",
  "D#": "D♯",
  Eb: "E♭",
  E: "E",
  F: "F",
  "F#": "F♯",
  Gb: "G♭",
  G: "G",
  "G#": "G♯",
  Ab: "A♭",
  A: "A",
  "A#": "A♯",
  Bb: "B♭",
  B: "B",
};

// Keyboard key → note name mapping
export const KEY_TO_NOTE: Record<string, NoteName> = {
  A: "C", W: "C#", S: "D", E: "D#", D: "E",
  F: "F", T: "F#", G: "G", Y: "G#", H: "A", U: "A#", J: "B",
};

export const NOTE_TO_KEY: Record<NoteName, string> = {
  C: "A",
  "C#": "W", Db: "W",
  D: "S",
  "D#": "E", Eb: "E",
  E: "D",
  F: "F",
  "F#": "T", Gb: "T",
  G: "G",
  "G#": "Y", Ab: "Y",
  A: "H",
  "A#": "U", Bb: "U",
  B: "J",
};

// Enharmonic mapping to check if two notes represent the same pitch
export const ENHARMONIC_MAP: Record<NoteName, NoteName> = {
  "C": "C",
  "C#": "C#", "Db": "C#",
  "D": "D",
  "D#": "D#", "Eb": "D#",
  "E": "E",
  "F": "F",
  "F#": "F#", "Gb": "F#",
  "G": "G",
  "G#": "G#", "Ab": "G#",
  "A": "A",
  "A#": "A#", "Bb": "A#",
  "B": "B"
};

// ─── Game State ───────────────────────────────────────────────────────────────

export type GamePhase = "idle" | "playing" | "feedback" | "ended";
export type FeedbackKind = "correct" | "wrong";

export interface HistoryEntry {
  target: NoteName;
  guess: NoteName;
  correct: boolean;
  points: number;
}

export interface GameState {
  phase: GamePhase;
  currentNote: NoteName | null;
  score: number;
  combo: number;
  maxCombo: number;
  totalAttempts: number;
  correctAttempts: number;
  timeLeft: number;
  feedback: FeedbackKind | null;
  lastGuess: NoteName | null;
  history: HistoryEntry[];
}

// ─── Config — designed to be extended for ranked/multiplayer ─────────────────

export interface GameConfig {
  /** Session length in seconds */
  duration: number;
  /** Practice simple natural white keys */
  practiceNatural: boolean;
  /** Practice sharp black keys */
  practiceSharp: boolean;
  /** Practice flat black keys */
  practiceFlat: boolean;
  /** Which octave to play */
  octave: number;
  /** Game mode — reserved for future ranked/multiplayer */
  mode: "training" | "timed" | "ranked" | "multiplayer";
}

export const DEFAULT_CONFIG: GameConfig = {
  duration: 60,
  practiceNatural: true,
  practiceSharp: true,
  practiceFlat: false,
  octave: 4,
  mode: "timed",
};
