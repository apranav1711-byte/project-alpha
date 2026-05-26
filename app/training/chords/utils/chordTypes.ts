import type { NoteName } from "../../types";

export type ChordCategory = "triads" | "sevenths" | "all";

export type ChordType =
  | "Major"
  | "Minor"
  | "Diminished"
  | "Augmented"
  | "Maj7"
  | "Min7"
  | "Dom7"
  | "HalfDim7";

export const CHORD_TYPE_LABELS: Record<ChordType, string> = {
  Major: "Major Triad",
  Minor: "Minor Triad",
  Diminished: "Diminished Triad",
  Augmented: "Augmented Triad",
  Maj7: "Major 7th",
  Min7: "Minor 7th",
  Dom7: "Dominant 7th",
  HalfDim7: "Half-Diminished 7th",
};

export const CHORD_INTERVALS: Record<ChordType, number[]> = {
  Major: [0, 4, 7],
  Minor: [0, 3, 7],
  Diminished: [0, 3, 6],
  Augmented: [0, 4, 8],
  Maj7: [0, 4, 7, 11],
  Min7: [0, 3, 7, 10],
  Dom7: [0, 4, 7, 10],
  HalfDim7: [0, 3, 6, 10],
};

export const SEMITONE_MAP: Record<NoteName, number> = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11
};

export const SEMITONES_TO_NOTE: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

export interface ChordNote {
  note: NoteName;
  octave: number;
}

export function generateChordNotes(root: NoteName, type: ChordType, baseOctave = 4): ChordNote[] {
  const rootSemitone = SEMITONE_MAP[root];
  const intervals = CHORD_INTERVALS[type];

  return intervals.map((interval) => {
    const totalSemitone = rootSemitone + interval;
    const noteIdx = totalSemitone % 12;
    const octaveOffset = Math.floor(totalSemitone / 12);
    
    return {
      note: SEMITONES_TO_NOTE[noteIdx],
      octave: baseOctave + octaveOffset,
    };
  });
}
