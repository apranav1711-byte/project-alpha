"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import * as Tone from "tone";
import type { SongMetadata, ParsedMidiNote, SongSegment } from "../types";
import type { NoteName } from "../../../training/types";

export function useToneSynthesizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);

  // Audio nodes
  const synthRef = useRef<Tone.Sampler | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const metronomeSynthRef = useRef<Tone.Synth | null>(null);

  // Scheduled timelines & tickers
  const activeTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isLoadedRef = useRef(false);

  // Initialize synthesizer nodes
  const initAudio = useCallback(async () => {
    if (isLoadedRef.current) return;
    await Tone.start();

    // Create a lush, premium acoustic reverb space
    const reverb = new Tone.Reverb({ decay: 2.0, preDelay: 0.04, wet: 0.32 }).toDestination();
    await reverb.ready;

    // Create a beautiful grand piano sampler using Tone.Sampler
    const sampler = new Tone.Sampler({
      urls: {
        C3: "C3.mp3",
        "D#3": "Ds3.mp3",
        "F#3": "Fs3.mp3",
        A3: "A3.mp3",
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
        C5: "C5.mp3",
        "D#5": "Ds5.mp3",
        "F#5": "Fs5.mp3",
        A5: "A5.mp3",
        C6: "C6.mp3",
      },
      release: 1.5,
      volume: -2, // slightly boosted for rich organic presence
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        setIsLoaded(true);
      },
    }).connect(reverb);

    // Metronome tick synth
    const metronome = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.002,
        decay: 0.05,
        sustain: 0,
        release: 0.05,
      },
    }).toDestination();
    metronome.volume.value = -12;

    synthRef.current = sampler;
    reverbRef.current = reverb;
    metronomeSynthRef.current = metronome;
    isLoadedRef.current = true;
  }, []);

  // Make sure we initialize audio on client side click
  useEffect(() => {
    const handleGesture = () => {
      initAudio().catch(() => {});
    };
    window.addEventListener("click", handleGesture);
    window.addEventListener("keydown", handleGesture);
    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, [initAudio]);

  // Clean up scheduled plays
  const clearPlayback = useCallback(() => {
    activeTimeouts.current.forEach(clearTimeout);
    activeTimeouts.current = [];
    setActiveNoteIdx(null);
    setIsPlaying(false);
  }, []);

  // Trigger a single note instantly
  const playNote = useCallback((note: NoteName, duration = "4n") => {
    if (!synthRef.current) return;
    try {
      // Map to standard octave 4 or 5
      const baseOctave = ["A", "A#", "B"].includes(note) ? 4 : 4;
      const octave = ["C5", "D5", "E5", "F5", "G5", "A5", "B5"].some(x => x.startsWith(note)) ? 5 : baseOctave;
      synthRef.current.triggerAttackRelease(`${note}${octave}`, duration);
    } catch {}
  }, []);

  // Synthesize and play the notes in a sequence (with Loop constraints and Tempo adjustments)
  const playSongSequence = useCallback((
    song: SongMetadata,
    segment: SongSegment | null = null,
    speedMult = 1,
    loop = false,
    hand: "left" | "right" | "both" = "both",
    onComplete?: () => void
  ) => {
    initAudio().catch(() => {});
    clearPlayback();
    setIsPlaying(true);

    const bpm = song.bpm * speedMult;
    const secondsPerBeat = 60 / bpm;

    // Filter notes based on the segment loop range
    const startBeat = segment ? segment.startBeat : 0;
    const endBeat = segment ? segment.endBeat : 9999;

    const notesToPlay = hand === "both"
      ? song.notes
      : song.notes.filter((n) => n.hand === hand);

    const filteredNotes = notesToPlay.filter(
      (n) => n.beat >= startBeat && n.beat <= endBeat
    );

    if (filteredNotes.length === 0) {
      setIsPlaying(false);
      return;
    }

    // Offset the time so the first note starts relative to 0
    const timeOffset = filteredNotes[0].time;

    // Playback loop runner
    const run = () => {
      let maxEnd = 0;

      filteredNotes.forEach((n, idx) => {
        const noteTimeSeconds = (n.time - timeOffset) / speedMult;
        const noteDurSeconds = n.duration / speedMult;

        // Schedule note playback
        const tid1 = setTimeout(() => {
          if (!synthRef.current) return;
          try {
            // Re-map to correct piano octave range derived from note.midi
            const octave = Math.floor(n.midi / 12) - 1;
            synthRef.current.triggerAttackRelease(`${n.note}${octave}`, noteDurSeconds);
            setActiveNoteIdx(idx);
          } catch {}
        }, noteTimeSeconds * 1000);

        activeTimeouts.current.push(tid1);

        const end = noteTimeSeconds + noteDurSeconds;
        if (end > maxEnd) maxEnd = end;
      });

      // Metronome clicks schedule
      if (metronomeOn) {
        const durationBeats = (song.notes[song.notes.length - 1].beat - song.notes[0].beat) || 16;
        for (let beat = 0; beat < durationBeats; beat++) {
          const beatTime = (beat * secondsPerBeat);
          if (beatTime > maxEnd) break;

          const tidMet = setTimeout(() => {
            if (!metronomeSynthRef.current) return;
            const pitch = beat % 4 === 0 ? "C6" : "C5";
            metronomeSynthRef.current.triggerAttackRelease(pitch, "32n");
          }, beatTime * 1000);

          activeTimeouts.current.push(tidMet);
        }
      }

      // Schedule completion / looping
      const tidComplete = setTimeout(() => {
        if (loop) {
          clearPlayback();
          run();
        } else {
          clearPlayback();
          if (onComplete) onComplete();
        }
      }, (maxEnd + 0.5) * 1000);

      activeTimeouts.current.push(tidComplete);
    };

    run();
  }, [initAudio, clearPlayback, metronomeOn]);

  // Metronome toggler
  const toggleMetronome = useCallback(() => {
    setMetronomeOn((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  return {
    isPlaying,
    metronomeOn,
    activeNoteIdx,
    playNote,
    playSongSequence,
    stopPlayback: clearPlayback,
    toggleMetronome,
    isLoaded,
  };
}
