import type { SongMetadata, ParsedMidiNote } from "../types";
import type { NoteName } from "../../../training/types";

// Helper to generate a clean note object
function createNote(
  note: NoteName,
  midi: number,
  beatStart: number,
  beatDur: number,
  bpm: number
): ParsedMidiNote {
  const secondsPerBeat = 60 / bpm;
  const hand = midi >= 60 ? "right" : "left";
  return {
    note,
    midi,
    time: parseFloat((beatStart * secondsPerBeat).toFixed(3)),
    duration: parseFloat((beatDur * secondsPerBeat).toFixed(3)),
    velocity: 0.8,
    beat: beatStart,
    beatsDur: beatDur,
    hand,
  };
}

export const PRELOADED_SONGS: SongMetadata[] = [
  // ─── 1. Ode to Joy ( Ludwig van Beethoven ) ──────────────────────────────────
  {
    id: "ode_to_joy",
    title: "Ode to Joy",
    artist: "Ludwig van Beethoven",
    genre: "Classical",
    bpm: 120,
    duration: 8.0,
    difficulty: 1,
    tags: ["Beginner", "Classical", "Beethoven"],
    noteCount: 16,
    octaveRange: "D4-G4",
    thumbnail: "hsl(142, 70%, 45%)",
    notes: [
      createNote("E", 64, 0, 1, 120),
      createNote("E", 64, 1, 1, 120),
      createNote("F", 65, 2, 1, 120),
      createNote("G", 67, 3, 1, 120),
      createNote("G", 67, 4, 1, 120),
      createNote("F", 65, 5, 1, 120),
      createNote("E", 64, 6, 1, 120),
      createNote("D", 62, 7, 1, 120),
      createNote("C", 60, 8, 1, 120),
      createNote("C", 60, 9, 1, 120),
      createNote("D", 62, 10, 1, 120),
      createNote("E", 64, 11, 1, 120),
      createNote("E", 64, 12, 1.5, 120),
      createNote("D", 62, 13.5, 0.5, 120),
      createNote("D", 62, 14, 2, 120),
    ],
    segments: [
      { name: "Full Song", startBeat: 0, endBeat: 16 },
      { name: "Intro Theme", startBeat: 0, endBeat: 8 },
      { name: "Cadence Loop", startBeat: 8, endBeat: 16 }
    ]
  },

  // ─── 2. Twinkle Twinkle Little Star ( Traditional ) ─────────────────────────
  {
    id: "twinkle_twinkle",
    title: "Twinkle Twinkle Little Star",
    artist: "Traditional",
    genre: "Traditional",
    bpm: 80,
    duration: 10.5,
    difficulty: 1,
    tags: ["Beginner", "Nursery Rhyme", "Kids"],
    noteCount: 14,
    octaveRange: "C4-A4",
    thumbnail: "hsl(45, 80%, 45%)",
    notes: [
      createNote("C", 60, 0, 1, 80),
      createNote("C", 60, 1, 1, 80),
      createNote("G", 67, 2, 1, 80),
      createNote("G", 67, 3, 1, 80),
      createNote("A", 69, 4, 1, 80),
      createNote("A", 69, 5, 1, 80),
      createNote("G", 67, 6, 2, 80),
      createNote("F", 65, 8, 1, 80),
      createNote("F", 65, 9, 1, 80),
      createNote("E", 64, 10, 1, 80),
      createNote("E", 64, 11, 1, 80),
      createNote("D", 62, 12, 1, 80),
      createNote("D", 62, 13, 1, 80),
      createNote("C", 60, 14, 2, 80),
    ],
    segments: [
      { name: "Full Song", startBeat: 0, endBeat: 16 },
      { name: "First Phrase", startBeat: 0, endBeat: 8 },
      { name: "Resolution", startBeat: 8, endBeat: 16 }
    ]
  },

  // ─── 3. Minuet in G ( Christian Petzold ) ─────────────────────────────────────
  {
    id: "minuet_in_g",
    title: "Minuet in G",
    artist: "Christian Petzold / J.S. Bach",
    genre: "Classical",
    bpm: 100,
    duration: 9.6,
    difficulty: 2,
    tags: ["Easy", "Baroque", "Famous Piano"],
    noteCount: 16,
    octaveRange: "G4-G5",
    thumbnail: "hsl(200, 75%, 45%)",
    notes: [
      createNote("D", 74, 0, 1, 100),
      createNote("G", 67, 1, 0.5, 100),
      createNote("A", 69, 1.5, 0.5, 100),
      createNote("B", 71, 2, 0.5, 100),
      createNote("C", 72, 2.5, 0.5, 100),
      createNote("D", 74, 3, 1, 100),
      createNote("G", 67, 4, 1, 100),
      createNote("G", 67, 5, 1, 100),
      createNote("E", 76, 6, 1, 100),
      createNote("C", 72, 7, 0.5, 100),
      createNote("D", 74, 7.5, 0.5, 100),
      createNote("E", 76, 8, 0.5, 100),
      createNote("F#", 78, 8.5, 0.5, 100),
      createNote("G", 80, 9, 1, 100),
      createNote("G", 67, 10, 1, 100),
      createNote("G", 67, 11, 1, 100),
    ],
    segments: [
      { name: "Full Song", startBeat: 0, endBeat: 12 },
      { name: "Ascending Theme", startBeat: 0, endBeat: 6 },
      { name: "Descending Cadence", startBeat: 6, endBeat: 12 }
    ]
  },

  // ─── 4. Canon in D ( Johann Pachelbel ) ───────────────────────────────────────
  {
    id: "canon_in_d",
    title: "Canon in D",
    artist: "Johann Pachelbel",
    genre: "Classical",
    bpm: 80,
    duration: 12.0,
    difficulty: 3,
    tags: ["Medium", "Wedding Classic", "Pachelbel"],
    noteCount: 16,
    octaveRange: "F#4-A5",
    thumbnail: "hsl(280, 65%, 45%)",
    notes: [
      createNote("F#", 78, 0, 1, 80),
      createNote("E", 76, 1, 1, 80),
      createNote("D", 74, 2, 1, 80),
      createNote("C#", 73, 3, 1, 80),
      createNote("B", 71, 4, 1, 80),
      createNote("A", 69, 5, 1, 80),
      createNote("B", 71, 6, 1, 80),
      createNote("C#", 73, 7, 1, 80),
      createNote("D", 74, 8, 1, 80),
      createNote("C#", 73, 9, 1, 80),
      createNote("B", 71, 10, 1, 80),
      createNote("A", 69, 11, 1, 80),
      createNote("G", 67, 12, 1, 80),
      createNote("F#", 66, 13, 1, 80),
      createNote("G", 67, 14, 1, 80),
      createNote("A", 69, 15, 1, 80),
    ],
    segments: [
      { name: "Full Song", startBeat: 0, endBeat: 16 },
      { name: "Chord Line 1", startBeat: 0, endBeat: 8 },
      { name: "Chord Line 2", startBeat: 8, endBeat: 16 }
    ]
  },

  // ─── 5. Amazing Grace ( Traditional ) ───────────────────────────────────────
  {
    id: "amazing_grace",
    title: "Amazing Grace",
    artist: "Traditional",
    genre: "Traditional",
    bpm: 90,
    duration: 10.6,
    difficulty: 2,
    tags: ["Easy", "Hymn", "Inspirational"],
    noteCount: 16,
    octaveRange: "D4-D5",
    thumbnail: "hsl(340, 70%, 45%)",
    notes: [
      createNote("D", 62, 0, 1, 90),
      createNote("G", 67, 1, 2, 90),
      createNote("B", 71, 3, 0.5, 90),
      createNote("G", 67, 3.5, 0.5, 90),
      createNote("B", 71, 4, 2, 90),
      createNote("A", 69, 6, 1, 90),
      createNote("G", 67, 7, 2, 90),
      createNote("E", 64, 9, 1, 90),
      createNote("D", 62, 10, 2, 90),
      createNote("D", 62, 12, 1, 90),
      createNote("G", 67, 13, 2, 90),
      createNote("B", 71, 15, 0.5, 90),
      createNote("G", 67, 15.5, 0.5, 90),
      createNote("B", 71, 16, 2, 90),
      createNote("A", 69, 18, 1, 90),
      createNote("D", 74, 19, 3, 90),
    ],
    segments: [
      { name: "Full Song", startBeat: 0, endBeat: 22 },
      { name: "Verse Start", startBeat: 0, endBeat: 10 },
      { name: "Verse Mid", startBeat: 10, endBeat: 22 }
    ]
  }
];
