"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ENHARMONIC_MAP, type NoteName } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tone = any;

interface Refs {
  tone: Tone;
  sampler: Tone;   // Tone.Sampler — real Salamander Grand Piano
  ui: Tone;        // Tone.Synth   — lightweight feedback chimes
  samplerLoaded: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAudio() {
  const refs = useRef<Refs>({ tone: null, sampler: null, ui: null, samplerLoaded: false });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const Tone = await import("tone");
        if (cancelled) return;
        refs.current.tone = Tone;

        // ── Reverb effect for gorgeous acoustic space ─────────────────────
        const reverb = new Tone.Reverb({
          decay: 2.0,
          preDelay: 0.04,
          wet: 0.32,
        }).toDestination();

        // ── UI feedback synth (tiny, loads instantly) ──
        refs.current.ui = new Tone.Synth({
          oscillator: { type: "triangle" }, // triangle wave is softer and warmer than sine
          envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.2 },
          volume: -10,
        }).connect(reverb);

        // ── Salamander Grand Piano sampler ──────────────────────────────────
        // Fuller set of samples covering octave 3 to 6 to eliminate pitch stretch distortion.
        // Hosted on the official Tone.js CDN (CORS-open).
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
          volume: -2, // slightly boosted to compensate for reverb decay
          baseUrl: "https://tonejs.github.io/audio/salamander/",
          onload: () => {
            if (cancelled) return;
            refs.current.samplerLoaded = true;
            setIsLoaded(true);
          },
        }).connect(reverb);

        refs.current.sampler = sampler;
      } catch (err) {
        console.warn("[useAudio] init failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Ensure the browser AudioContext is running (user-gesture policy) ───────
  const ensureStarted = useCallback(async (): Promise<boolean> => {
    const { tone } = refs.current;
    if (!tone) return false;
    if (tone.getContext().state !== "running") await tone.start();
    return true;
  }, []);

  // ── Play a piano note (sampler = real piano sound) ────────────────────────
  // Called both for the challenge note AND for every key the user presses.
  const playNote = useCallback(
    async (note: NoteName, octave = 4) => {
      const ok = await ensureStarted();
      if (!ok) return;
      const { sampler, samplerLoaded } = refs.current;
      if (!sampler || !samplerLoaded) return;
      try {
        const sharpNote = ENHARMONIC_MAP[note] || note;
        // triggerAttack + schedule release for a natural piano decay
        sampler.triggerAttackRelease(`${sharpNote}${octave}`, "2n");
      } catch {
        /* ignore overlap errors */
      }
    },
    [ensureStarted]
  );

  // ── Play a piano chord (polyphonic playback) ──────────────────────────────
  const playChord = useCallback(
    async (notes: { note: NoteName; octave?: number }[]) => {
      const ok = await ensureStarted();
      if (!ok) return;
      const { sampler, samplerLoaded } = refs.current;
      if (!sampler || !samplerLoaded) return;
      try {
        const noteStrings = notes.map((n) => {
          const sharpNote = ENHARMONIC_MAP[n.note] || n.note;
          const oct = n.octave !== undefined ? n.octave : 4;
          return `${sharpNote}${oct}`;
        });
        sampler.triggerAttackRelease(noteStrings, "2n");
      } catch {
        /* ignore overlap errors */
      }
    },
    [ensureStarted]
  );

  // ── Success chime (ascending triad) ───────────────────────────────────────
  const playSuccess = useCallback(async () => {
    if (!(await ensureStarted())) return;
    const { ui, tone } = refs.current;
    if (!ui) return;
    const now = tone.now();
    try {
      ui.triggerAttackRelease("E5", "0.08", now);
      ui.triggerAttackRelease("G5", "0.08", now + 0.1);
      ui.triggerAttackRelease("B5", "0.12", now + 0.2);
    } catch {}
  }, [ensureStarted]);

  // ── Error buzz ────────────────────────────────────────────────────────────
  const playError = useCallback(async () => {
    if (!(await ensureStarted())) return;
    const { ui, tone } = refs.current;
    if (!ui) return;
    try {
      ui.triggerAttackRelease("A2", "0.2", tone.now());
    } catch {}
  }, [ensureStarted]);

  // Synchronous-signature wrapper for callbacks that can't await
  const playNoteSync = useCallback(
    (note: NoteName, octave = 4) => void playNote(note, octave),
    [playNote]
  );

  return {
    /** Play any piano note — call this for EVERY key press, always */
    playNote: playNoteSync,
    playChord,
    playSuccess,
    playError,
    /** True once Salamander samples are downloaded and decoded */
    isLoaded,
  };
}
