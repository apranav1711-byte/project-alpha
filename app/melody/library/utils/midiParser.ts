import { Midi } from "@tonejs/midi";
import type { SongMetadata, ParsedMidiNote, SongSegment, LibraryDifficulty } from "../types";
import type { NoteName } from "../../../training/types";

// Helper to map midi note number to NoteName
const MIDI_NUMBER_TO_NOTE_NAME: Record<number, NoteName> = {
  12: "C", 13: "C#", 14: "D", 15: "D#", 16: "E", 17: "F", 18: "F#", 19: "G", 20: "G#", 21: "A", 22: "A#", 23: "B",
  24: "C", 25: "C#", 26: "D", 27: "D#", 28: "E", 29: "F", 30: "F#", 31: "G", 32: "G#", 33: "A", 34: "A#", 35: "B",
  36: "C", 37: "C#", 38: "D", 39: "D#", 40: "E", 41: "F", 42: "F#", 43: "G", 44: "G#", 45: "A", 46: "A#", 47: "B",
  48: "C", 49: "C#", 50: "D", 51: "D#", 52: "E", 53: "F", 54: "F#", 55: "G", 56: "G#", 57: "A", 58: "A#", 59: "B",
  60: "C", 61: "C#", 62: "D", 63: "D#", 64: "E", 65: "F", 66: "F#", 67: "G", 68: "G#", 69: "A", 70: "A#", 71: "B",
  72: "C", 73: "C#", 74: "D", 75: "D#", 76: "E", 77: "F", 78: "F#", 79: "G", 80: "G#", 81: "A", 82: "A#", 83: "B",
  84: "C", 85: "C#", 86: "D", 87: "D#", 88: "E", 89: "F", 90: "F#", 91: "G", 92: "G#", 93: "A", 94: "A#", 95: "B",
  96: "C", 97: "C#", 98: "D", 99: "D#", 100: "E", 101: "F", 102: "F#", 103: "G", 104: "G#", 105: "A", 106: "A#", 107: "B",
  108: "C", 109: "C#", 110: "D", 111: "D#", 112: "E", 113: "F", 114: "F#", 115: "G", 116: "G#", 117: "A", 118: "A#", 119: "B",
};

export function midiNumberToNoteName(midiNum: number): NoteName {
  const norm = midiNum % 12;
  const names: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return names[norm] ?? "C";
}

/**
 * Parses a raw MIDI file ArrayBuffer and converts it to a structured SongMetadata model.
 */
export function parseMidiBuffer(arrayBuffer: ArrayBuffer, fileName: string): SongMetadata {
  const midi = new Midi(arrayBuffer);

  // Extract primary tempo / BPM (default to 120)
  const bpm = midi.header.tempos[0]?.bpm ? Math.round(midi.header.tempos[0].bpm) : 120;
  const secondsPerBeat = 60 / bpm;

  // Extract notes from all tracks rather than discarding any
  const rawNotes: any[] = [];
  midi.tracks.forEach((track) => {
    rawNotes.push(...track.notes);
  });

  // Map and sort raw MIDI notes
  const notesList: ParsedMidiNote[] = rawNotes.map((n) => {
    const noteName = midiNumberToNoteName(n.midi);
    const beat = n.time / secondsPerBeat;
    const beatsDur = n.duration / secondsPerBeat;
    const hand = n.midi >= 60 ? "right" : "left";

    return {
      note: noteName,
      midi: n.midi,
      time: parseFloat(n.time.toFixed(3)),
      duration: parseFloat(n.duration.toFixed(3)),
      velocity: parseFloat((n.velocity ?? 0.8).toFixed(2)),
      beat: parseFloat(beat.toFixed(2)),
      beatsDur: parseFloat(beatsDur.toFixed(2)),
      hand,
    };
  });

  // Sort notes by start time (seconds)
  notesList.sort((a, b) => a.time - b.time);

  // DEDUPLICATE POLYPHONIC NOTES PER HAND:
  // If multiple notes start at the exact same time (within 0.05s) on the SAME hand, 
  // only keep the one with the highest pitch. This keeps both left-hand and right-hand melodies clean,
  // while preserving right-and-left hand harmonies!
  const rightNotes = notesList.filter((n) => n.hand === "right");
  const leftNotes = notesList.filter((n) => n.hand === "left");

  const cleanRight: ParsedMidiNote[] = [];
  let lastRightTime = -999;
  for (const note of rightNotes) {
    if (Math.abs(note.time - lastRightTime) < 0.05) {
      const lastIdx = cleanRight.length - 1;
      if (lastIdx >= 0 && note.midi > cleanRight[lastIdx].midi) {
        cleanRight[lastIdx] = note;
      }
    } else {
      cleanRight.push(note);
      lastRightTime = note.time;
    }
  }

  const cleanLeft: ParsedMidiNote[] = [];
  let lastLeftTime = -999;
  for (const note of leftNotes) {
    if (Math.abs(note.time - lastLeftTime) < 0.05) {
      const lastIdx = cleanLeft.length - 1;
      if (lastIdx >= 0 && note.midi > cleanLeft[lastIdx].midi) {
        cleanLeft[lastIdx] = note;
      }
    } else {
      cleanLeft.push(note);
      lastLeftTime = note.time;
    }
  }

  // Merge them back and sort by start time
  const cleanMelodyNotes = [...cleanRight, ...cleanLeft].sort((a, b) => a.time - b.time);

  // Calculate duration
  const totalDuration = cleanMelodyNotes.length > 0 
    ? cleanMelodyNotes[cleanMelodyNotes.length - 1].time + cleanMelodyNotes[cleanMelodyNotes.length - 1].duration
    : 0;

  // Calculate Octave Range
  let minMidi = 127;
  let maxMidi = 0;
  cleanMelodyNotes.forEach((n) => {
    if (n.midi < minMidi) minMidi = n.midi;
    if (n.midi > maxMidi) maxMidi = n.midi;
  });

  const getOctaveLabel = (midiNum: number) => {
    const octave = Math.floor(midiNum / 12) - 1;
    const name = midiNumberToNoteName(midiNum);
    return `${name}${octave}`;
  };

  const octaveRange = cleanMelodyNotes.length > 0
    ? `${getOctaveLabel(minMidi)}-${getOctaveLabel(maxMidi)}`
    : "C4-C5";

  // Auto-classify difficulty (1-5) based on pitch range & note speed density
  const range = maxMidi - minMidi;
  let difficulty: LibraryDifficulty = 1;
  if (range > 24 || cleanMelodyNotes.length > 80) difficulty = 5; // Expert
  else if (range > 18 || cleanMelodyNotes.length > 50) difficulty = 4; // Hard
  else if (range > 12 || cleanMelodyNotes.length > 30) difficulty = 3; // Medium
  else if (range > 7 || cleanMelodyNotes.length > 15) difficulty = 2; // Easy
  else difficulty = 1; // Beginner

  // Generate automated standard segments (Intro / Chorus / Bridge / Full Song)
  const totalBeats = totalDuration / secondsPerBeat;
  const segments: SongSegment[] = [];

  if (totalBeats > 0) {
    segments.push({ name: "Full Song", startBeat: 0, endBeat: parseFloat(totalBeats.toFixed(1)) });
    
    if (totalBeats > 16) {
      const p1 = parseFloat((totalBeats * 0.25).toFixed(1));
      const p2 = parseFloat((totalBeats * 0.75).toFixed(1));
      segments.push({ name: "Intro", startBeat: 0, endBeat: p1 });
      segments.push({ name: "Chorus", startBeat: p1, endBeat: p2 });
      segments.push({ name: "Bridge", startBeat: p2, endBeat: parseFloat(totalBeats.toFixed(1)) });
    }
  }

  // Generate pretty humanized titles from file name
  const titleRaw = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const title = titleRaw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return {
    id: `custom_${Date.now()}`,
    title,
    artist: "Community Composer",
    genre: "Custom Upload",
    bpm,
    duration: parseFloat(totalDuration.toFixed(1)),
    difficulty,
    tags: ["Midi Upload", "Ear Training"],
    noteCount: cleanMelodyNotes.length,
    octaveRange,
    thumbnail: `hsl(${(Date.now() % 360)}, 70%, 40%)`,
    notes: cleanMelodyNotes,
    segments,
    isCustom: true,
  };
}
