import type { NoteName } from "../training/types";
export type { NoteName };

export type MelodyDifficulty = 1 | 2 | 3 | 4 | 5;

export type MelodyPhase =
  | "idle"
  | "countdown"
  | "listening"
  | "inputting"
  | "result"
  | "session_end";

export interface MelodyNote {
  note: NoteName;
  beats: number; // how long note rings
  gap: number;   // silence before note (in beats)
}

export interface Melody {
  id: string;
  name: string;
  notes: MelodyNote[];
  bpm: number;
  difficulty: MelodyDifficulty;
  packId: string;
}

export interface MelodyPack {
  id: string;
  name: string;
  description: string;
  difficulty: MelodyDifficulty;
  /** Avg accuracy % required to unlock this pack */
  unlockAccuracy: number;
  color: string;
  melodies: Melody[];
}

export interface NoteAttempt {
  index: number;
  expected: NoteName;
  played: NoteName | null;
  correct: boolean;
  timingOffsetMs: number;
  timingScore: number; // 0–100
}

export interface RoundResult {
  melody: Melody;
  attempts: NoteAttempt[];
  score: number;
  noteAccuracy: number;
  timingAccuracy: number;
  maxCombo: number;
  livesLost: number;
  perfect: boolean;
}

export interface MelodySessionStats {
  totalScore: number;
  roundsPlayed: number;
  totalNotes: number;
  correctNotes: number;
  avgAccuracy: number;
  maxCombo: number;
  packId: string;
  difficulty: MelodyDifficulty;
}
