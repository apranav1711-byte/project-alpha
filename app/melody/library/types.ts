import type { NoteName } from "../../training/types";
export type { NoteName };

export type LibraryDifficulty = 1 | 2 | 3 | 4 | 5;

export type LibraryPhase =
  | "idle"
  | "loading"
  | "listening"
  | "inputting"
  | "paused"
  | "result";

export interface ParsedMidiNote {
  note: NoteName;
  midi: number;
  time: number;      // start time in seconds
  duration: number;  // duration in seconds
  velocity: number;  // velocity 0 to 1
  beat: number;      // start time in beats
  beatsDur: number;  // duration in beats
  hand?: "right" | "left";
}

export interface SongSegment {
  name: string;      // e.g. "Intro", "Chorus", "Bridge", "Full Song"
  startBeat: number;
  endBeat: number;
}

export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  genre: string;     // e.g. "Classical", "Pop", "Jazz", "Exercise"
  bpm: number;
  duration: number;  // in seconds
  difficulty: LibraryDifficulty;
  tags: string[];
  noteCount: number;
  octaveRange: string; // e.g. "C4-G5"
  thumbnail?: string;  // thumbnail color or URL
  notes: ParsedMidiNote[];
  segments: SongSegment[];
  isCustom?: boolean;  // uploaded by user
}

export interface LibraryNoteAttempt {
  index: number;
  expected: NoteName;
  played: NoteName | null;
  correct: boolean;
  timeOffsetMs: number;
  durationOffsetMs: number;
  timingScore: number;    // 0-100 rhythm score
  durationScore: number;  // 0-100 duration score
}

export interface LibraryRoundResult {
  songId: string;
  songTitle: string;
  attempts: LibraryNoteAttempt[];
  score: number;
  accuracy: number;        // percentage
  timingAccuracy: number;  // percentage
  durationAccuracy: number;// percentage
  maxCombo: number;
  missedCount: number;
  grade: "S" | "A" | "B" | "C" | "D";
  completedAt: number;
}

export interface LibraryRecentHistory {
  songId: string;
  title: string;
  artist: string;
  difficulty: LibraryDifficulty;
  playedAt: number;
  accuracy: number;
  score: number;
}
