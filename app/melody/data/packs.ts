import type { MelodyPack, Melody } from "../types";

// ─── Pack definitions ─────────────────────────────────────────────────────────
// 5 packs × 5 melodies = 25 total melodies

export const MELODY_PACKS: MelodyPack[] = [
  // ─── PACK 1: Beginner — 3 notes, BPM 60, naturals only ─────────────────────
  {
    id: "beginner",
    name: "First Steps",
    description: "3 notes · naturals only · slow tempo",
    difficulty: 1,
    unlockAccuracy: 0,
    color: "#4ade80",
    melodies: [
      {
        id: "b1", name: "Step Up", packId: "beginner", difficulty: 1, bpm: 60,
        notes: [
          { note: "C", beats: 1, gap: 0 },
          { note: "D", beats: 1, gap: 0 },
          { note: "E", beats: 2, gap: 0 },
        ],
      },
      {
        id: "b2", name: "Step Down", packId: "beginner", difficulty: 1, bpm: 60,
        notes: [
          { note: "E", beats: 1, gap: 0 },
          { note: "D", beats: 1, gap: 0 },
          { note: "C", beats: 2, gap: 0 },
        ],
      },
      {
        id: "b3", name: "Skip Up", packId: "beginner", difficulty: 1, bpm: 60,
        notes: [
          { note: "C", beats: 1, gap: 0 },
          { note: "E", beats: 1, gap: 0 },
          { note: "G", beats: 2, gap: 0 },
        ],
      },
      {
        id: "b4", name: "Skip Down", packId: "beginner", difficulty: 1, bpm: 60,
        notes: [
          { note: "G", beats: 1, gap: 0 },
          { note: "E", beats: 1, gap: 0 },
          { note: "C", beats: 2, gap: 0 },
        ],
      },
      {
        id: "b5", name: "Echo", packId: "beginner", difficulty: 1, bpm: 60,
        notes: [
          { note: "C", beats: 0.5, gap: 0 },
          { note: "C", beats: 0.5, gap: 0.5 },
          { note: "D", beats: 2, gap: 0 },
        ],
      },
    ],
  },

  // ─── PACK 2: Easy — 4 notes, BPM 72, naturals + some duration variation ────
  {
    id: "easy",
    name: "Finding Rhythm",
    description: "4 notes · naturals · varied duration",
    difficulty: 2,
    unlockAccuracy: 80,
    color: "#5ba4cf",
    melodies: [
      {
        id: "e1", name: "Up Down", packId: "easy", difficulty: 2, bpm: 72,
        notes: [
          { note: "C", beats: 1, gap: 0 },
          { note: "D", beats: 1, gap: 0 },
          { note: "E", beats: 1, gap: 0 },
          { note: "D", beats: 2, gap: 0 },
        ],
      },
      {
        id: "e2", name: "Major Walk", packId: "easy", difficulty: 2, bpm: 72,
        notes: [
          { note: "C", beats: 1, gap: 0 },
          { note: "E", beats: 1, gap: 0 },
          { note: "G", beats: 1, gap: 0 },
          { note: "C", beats: 2, gap: 0 },
        ],
      },
      {
        id: "e3", name: "Gentle Fall", packId: "easy", difficulty: 2, bpm: 72,
        notes: [
          { note: "A", beats: 1, gap: 0 },
          { note: "G", beats: 1, gap: 0 },
          { note: "F", beats: 1, gap: 0 },
          { note: "E", beats: 2, gap: 0 },
        ],
      },
      {
        id: "e4", name: "Bounce", packId: "easy", difficulty: 2, bpm: 72,
        notes: [
          { note: "C", beats: 1, gap: 0 },
          { note: "G", beats: 1, gap: 0 },
          { note: "E", beats: 1, gap: 0 },
          { note: "C", beats: 2, gap: 0 },
        ],
      },
      {
        id: "e5", name: "Mirror", packId: "easy", difficulty: 2, bpm: 72,
        notes: [
          { note: "D", beats: 1, gap: 0 },
          { note: "E", beats: 0.5, gap: 0 },
          { note: "E", beats: 0.5, gap: 0.5 },
          { note: "D", beats: 2, gap: 0 },
        ],
      },
    ],
  },

  // ─── PACK 3: Medium — 5 notes, BPM 84, sharps introduced ───────────────────
  {
    id: "medium",
    name: "Sharp Edges",
    description: "5 notes · sharps introduced · 84 BPM",
    difficulty: 3,
    unlockAccuracy: 80,
    color: "#e2b714",
    melodies: [
      {
        id: "m1", name: "C Major Scale", packId: "medium", difficulty: 3, bpm: 84,
        notes: [
          { note: "C", beats: 0.75, gap: 0 },
          { note: "D", beats: 0.75, gap: 0 },
          { note: "E", beats: 0.75, gap: 0 },
          { note: "F", beats: 0.75, gap: 0 },
          { note: "G", beats: 1.5,  gap: 0 },
        ],
      },
      {
        id: "m2", name: "Chromatic Rise", packId: "medium", difficulty: 3, bpm: 84,
        notes: [
          { note: "C",  beats: 0.75, gap: 0 },
          { note: "C#", beats: 0.75, gap: 0 },
          { note: "D",  beats: 0.75, gap: 0 },
          { note: "D#", beats: 0.75, gap: 0 },
          { note: "E",  beats: 1.5,  gap: 0 },
        ],
      },
      {
        id: "m3", name: "D Major Leap", packId: "medium", difficulty: 3, bpm: 84,
        notes: [
          { note: "D",  beats: 1,   gap: 0 },
          { note: "F#", beats: 1,   gap: 0 },
          { note: "A",  beats: 1,   gap: 0 },
          { note: "F#", beats: 0.5, gap: 0 },
          { note: "D",  beats: 1.5, gap: 0 },
        ],
      },
      {
        id: "m4", name: "Mountain", packId: "medium", difficulty: 3, bpm: 84,
        notes: [
          { note: "C", beats: 0.75, gap: 0 },
          { note: "E", beats: 0.75, gap: 0 },
          { note: "G", beats: 0.75, gap: 0 },
          { note: "A", beats: 0.75, gap: 0 },
          { note: "G", beats: 1.5,  gap: 0 },
        ],
      },
      {
        id: "m5", name: "Sharp Fall", packId: "medium", difficulty: 3, bpm: 84,
        notes: [
          { note: "G",  beats: 0.75, gap: 0 },
          { note: "F#", beats: 0.75, gap: 0 },
          { note: "E",  beats: 0.75, gap: 0 },
          { note: "D",  beats: 0.75, gap: 0 },
          { note: "C",  beats: 1.5,  gap: 0 },
        ],
      },
    ],
  },

  // ─── PACK 4: Hard — 6-7 notes, BPM 96, flats + rhythm variation ────────────
  {
    id: "hard",
    name: "Complex Patterns",
    description: "6–7 notes · sharps & flats · rhythmic variation",
    difficulty: 4,
    unlockAccuracy: 80,
    color: "#c084fc",
    melodies: [
      {
        id: "h1", name: "Sequence", packId: "hard", difficulty: 4, bpm: 96,
        notes: [
          { note: "C", beats: 0.5, gap: 0 },
          { note: "D", beats: 0.5, gap: 0 },
          { note: "E", beats: 0.5, gap: 0 },
          { note: "C", beats: 0.5, gap: 0 },
          { note: "D", beats: 0.5, gap: 0 },
          { note: "G", beats: 1.5, gap: 0 },
        ],
      },
      {
        id: "h2", name: "Minor Touch", packId: "hard", difficulty: 4, bpm: 96,
        notes: [
          { note: "C",  beats: 0.75, gap: 0 },
          { note: "Eb", beats: 0.75, gap: 0 },
          { note: "F",  beats: 0.75, gap: 0 },
          { note: "G",  beats: 0.75, gap: 0 },
          { note: "Ab", beats: 0.75, gap: 0 },
          { note: "G",  beats: 1.5,  gap: 0 },
        ],
      },
      {
        id: "h3", name: "Zigzag", packId: "hard", difficulty: 4, bpm: 96,
        notes: [
          { note: "C", beats: 0.5, gap: 0 },
          { note: "G", beats: 0.5, gap: 0 },
          { note: "E", beats: 0.5, gap: 0 },
          { note: "B", beats: 0.5, gap: 0 },
          { note: "F", beats: 0.5, gap: 0 },
          { note: "D", beats: 1.5, gap: 0 },
        ],
      },
      {
        id: "h4", name: "Swing Feel", packId: "hard", difficulty: 4, bpm: 96,
        notes: [
          { note: "C", beats: 1,   gap: 0   },
          { note: "E", beats: 0.5, gap: 0.5 },
          { note: "G", beats: 1,   gap: 0   },
          { note: "E", beats: 0.5, gap: 0.5 },
          { note: "C", beats: 0.5, gap: 0   },
          { note: "D", beats: 1.5, gap: 0   },
        ],
      },
      {
        id: "h5", name: "Jazz Steps", packId: "hard", difficulty: 4, bpm: 96,
        notes: [
          { note: "D",  beats: 0.5,  gap: 0 },
          { note: "E",  beats: 0.5,  gap: 0 },
          { note: "F#", beats: 0.75, gap: 0 },
          { note: "G",  beats: 0.75, gap: 0 },
          { note: "A",  beats: 0.75, gap: 0 },
          { note: "G",  beats: 0.5,  gap: 0 },
          { note: "F#", beats: 1.5,  gap: 0 },
        ],
      },
    ],
  },

  // ─── PACK 5: Expert — 8-10 notes, BPM 110, full range + complex rhythm ──────
  {
    id: "expert",
    name: "Expert Challenge",
    description: "8–10 notes · full range · complex rhythm",
    difficulty: 5,
    unlockAccuracy: 80,
    color: "#ca4754",
    melodies: [
      {
        id: "x1", name: "Natural Minor", packId: "expert", difficulty: 5, bpm: 110,
        notes: [
          { note: "A", beats: 0.5, gap: 0 },
          { note: "B", beats: 0.5, gap: 0 },
          { note: "C", beats: 0.5, gap: 0 },
          { note: "D", beats: 0.5, gap: 0 },
          { note: "E", beats: 0.5, gap: 0 },
          { note: "F", beats: 0.5, gap: 0 },
          { note: "G", beats: 0.5, gap: 0 },
          { note: "A", beats: 1,   gap: 0 },
        ],
      },
      {
        id: "x2", name: "Bell Melody", packId: "expert", difficulty: 5, bpm: 110,
        notes: [
          { note: "E", beats: 0.5, gap: 0 },
          { note: "F", beats: 0.5, gap: 0 },
          { note: "G", beats: 0.5, gap: 0 },
          { note: "A", beats: 0.5, gap: 0 },
          { note: "B", beats: 0.5, gap: 0 },
          { note: "A", beats: 0.5, gap: 0 },
          { note: "G", beats: 0.5, gap: 0 },
          { note: "F", beats: 0.5, gap: 0 },
          { note: "E", beats: 1,   gap: 0 },
        ],
      },
      {
        id: "x3", name: "Chromatic Drop", packId: "expert", difficulty: 5, bpm: 110,
        notes: [
          { note: "A",  beats: 0.5, gap: 0 },
          { note: "Ab", beats: 0.5, gap: 0 },
          { note: "G",  beats: 0.5, gap: 0 },
          { note: "F#", beats: 0.5, gap: 0 },
          { note: "F",  beats: 0.5, gap: 0 },
          { note: "E",  beats: 0.5, gap: 0 },
          { note: "Eb", beats: 0.5, gap: 0 },
          { note: "D",  beats: 1,   gap: 0 },
        ],
      },
      {
        id: "x4", name: "Melodic Minor", packId: "expert", difficulty: 5, bpm: 110,
        notes: [
          { note: "C",  beats: 0.5, gap: 0 },
          { note: "D",  beats: 0.5, gap: 0 },
          { note: "Eb", beats: 0.5, gap: 0 },
          { note: "F",  beats: 0.5, gap: 0 },
          { note: "G",  beats: 0.5, gap: 0 },
          { note: "A",  beats: 0.5, gap: 0 },
          { note: "B",  beats: 0.5, gap: 0 },
          { note: "C",  beats: 1,   gap: 0 },
        ],
      },
      {
        id: "x5", name: "Rapid Fire", packId: "expert", difficulty: 5, bpm: 120,
        notes: [
          { note: "G", beats: 0.25, gap: 0 },
          { note: "A", beats: 0.25, gap: 0 },
          { note: "B", beats: 0.5,  gap: 0 },
          { note: "G", beats: 0.25, gap: 0 },
          { note: "A", beats: 0.25, gap: 0 },
          { note: "B", beats: 0.5,  gap: 0 },
          { note: "D", beats: 0.25, gap: 0 },
          { note: "C", beats: 0.25, gap: 0 },
          { note: "B", beats: 0.5,  gap: 0 },
          { note: "G", beats: 1,    gap: 0 },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getPackById(id: string): MelodyPack | undefined {
  return MELODY_PACKS.find((p) => p.id === id);
}

/** Returns ms timestamp for when each note should be pressed during playback */
export function computeExpectedTimes(melody: Melody, speedMult = 1): number[] {
  const msPerBeat = 60_000 / melody.bpm / speedMult;
  const times: number[] = [];
  let t = 0;
  for (const mn of melody.notes) {
    t += mn.gap * msPerBeat;
    times.push(t);
    t += mn.beats * msPerBeat;
  }
  return times;
}

/** Total playback duration in ms */
export function totalDurationMs(melody: Melody, speedMult = 1): number {
  const msPerBeat = 60_000 / melody.bpm / speedMult;
  let t = 0;
  for (const mn of melody.notes) {
    t += (mn.gap + mn.beats) * msPerBeat;
  }
  return t;
}

/** Lives available per difficulty level */
export const LIVES_BY_DIFF: Record<number, number> = { 1: 3, 2: 3, 3: 3, 4: 2, 5: 1 };
