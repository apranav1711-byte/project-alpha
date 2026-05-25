"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { MELODY_PACKS, computeExpectedTimes, LIVES_BY_DIFF, getPackById } from "../data/packs";
import type {
  MelodyPhase, Melody, MelodyPack, NoteAttempt, RoundResult, NoteName,
} from "../types";

// ─── State shape ─────────────────────────────────────────────────────────────

export interface MelodyEngineState {
  phase: MelodyPhase;
  packId: string | null;
  melodyIndex: number;
  score: number;
  lives: number;
  maxLives: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  inputIndex: number;
  attempts: NoteAttempt[];
  inputStartTime: number;
  expectedTimes: number[];
  roundResults: RoundResult[];
  countdown: number;
  unlockedPacks: string[];
  slowMode: boolean;
  newlyUnlocked: string | null; // pack id just unlocked, shown in session_end
  replayTrigger: number;
}

const INITIAL_STATE: MelodyEngineState = {
  phase: "idle",
  packId: null,
  melodyIndex: 0,
  score: 0,
  lives: 3,
  maxLives: 3,
  combo: 0,
  maxCombo: 0,
  multiplier: 1,
  inputIndex: 0,
  attempts: [],
  inputStartTime: 0,
  expectedTimes: [],
  roundResults: [],
  countdown: 3,
  unlockedPacks: ["beginner"],
  slowMode: false,
  newlyUnlocked: null,
  replayTrigger: 0,
};

function calcTimingScore(offsetMs: number): number {
  return Math.max(0, Math.round(100 - Math.abs(offsetMs) / 5));
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMelodyEngine() {
  const [state, setState] = useState<MelodyEngineState>(INITIAL_STATE);

  // Refs to avoid stale closures in callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load unlocks from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alpha-melody-unlocks");
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        setState((prev) => ({ ...prev, unlockedPacks: parsed }));
      }
    } catch {}
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const currentPack: MelodyPack | null =
    state.packId ? (getPackById(state.packId) ?? null) : null;
  const currentMelody: Melody | null =
    currentPack?.melodies[state.melodyIndex] ?? null;

  // Keep refs for use in callbacks
  const packRef = useRef(currentPack);
  const melodyRef = useRef(currentMelody);
  packRef.current = currentPack;
  melodyRef.current = currentMelody;

  // ── Select pack ─────────────────────────────────────────────────────────────
  const selectPack = useCallback((packId: string) => {
    const pack = getPackById(packId);
    if (!pack) return;
    const maxLives = LIVES_BY_DIFF[pack.difficulty] ?? 3;
    setState((prev) => ({
      ...prev,
      packId,
      melodyIndex: 0,
      score: 0,
      lives: maxLives,
      maxLives,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      attempts: [],
      roundResults: [],
      phase: "idle",
      newlyUnlocked: null,
    }));
  }, []);

  // ── Countdown ────────────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "listening", countdown: 0, replayTrigger: 0 }));
  }, []);

  const tickCountdown = useCallback(() => {
    setState((prev) => {
      if (prev.countdown <= 1) return { ...prev, phase: "listening", countdown: 0 };
      return { ...prev, countdown: prev.countdown - 1 };
    });
  }, []);

  // ── Listening complete → begin input ────────────────────────────────────────
  const onListeningComplete = useCallback(() => {
    const melody = melodyRef.current;
    if (!melody) return;
    const speedMult = stateRef.current.slowMode ? 0.5 : 1;
    const expectedTimes = computeExpectedTimes(melody, speedMult);
    setState((prev) => ({
      ...prev,
      phase: "inputting",
      inputIndex: 0,
      attempts: [],
      inputStartTime: Date.now(),
      expectedTimes,
    }));
  }, []);

  // ── Submit a note guess ─────────────────────────────────────────────────────
  const submitNote = useCallback(
    (note: NoteName, timestamp: number): { correct: boolean; expected: NoteName } => {
      const melody = melodyRef.current;
      const s = stateRef.current;

      const isFromListening = s.phase === "listening";

      if (!melody || (s.phase !== "inputting" && !isFromListening) || s.inputIndex >= melody.notes.length) {
        return { correct: false, expected: "C" };
      }

      const speedMult = s.slowMode ? 0.5 : 1;
      const expectedTimes = isFromListening ? computeExpectedTimes(melody, speedMult) : s.expectedTimes;
      const inputStartTime = isFromListening ? timestamp : s.inputStartTime;
      const currentInputIndex = isFromListening ? 0 : s.inputIndex;
      const currentAttempts = isFromListening ? [] : s.attempts;

      const expected = melody.notes[currentInputIndex].note;
      const correct = note === expected;
      const actualTime = timestamp - inputStartTime;
      const expectedTime = expectedTimes[currentInputIndex] ?? 0;
      const offset = actualTime - expectedTime;
      const tScore = calcTimingScore(offset);

      const attempt: NoteAttempt = {
        index: currentInputIndex,
        expected,
        played: note,
        correct,
        timingOffsetMs: offset,
        timingScore: tScore,
      };

      const newCombo = correct ? s.combo + 1 : 0;
      const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 5));
      const noteScore = correct ? Math.round((100 + tScore * 0.5) * newMultiplier) : 0;
      const newLives = correct ? s.lives : Math.max(0, s.lives - 1);
      const newInputIndex = currentInputIndex + 1;
      const newAttempts = [...currentAttempts, attempt];
      const newMaxCombo = Math.max(s.maxCombo, newCombo);
      const newScore = s.score + noteScore;

      const isRoundDone = newInputIndex >= melody.notes.length;

      if (isRoundDone) {
        const correctCount = newAttempts.filter((a) => a.correct).length;
        const noteAccuracy = Math.round((correctCount / newAttempts.length) * 100);
        const timingAccuracy = Math.round(
          newAttempts.reduce((s, a) => s + a.timingScore, 0) / newAttempts.length
        );

        const result: RoundResult = {
          melody,
          attempts: newAttempts,
          score: newScore,
          noteAccuracy,
          timingAccuracy,
          maxCombo: newMaxCombo,
          livesLost: s.maxLives - newLives,
          perfect: newAttempts.every((a) => a.correct),
        };

        setState((prev) => ({
          ...prev,
          phase: "result",
          score: newScore,
          lives: newLives,
          combo: newCombo,
          maxCombo: newMaxCombo,
          multiplier: newMultiplier,
          inputIndex: newInputIndex,
          attempts: newAttempts,
          roundResults: [...prev.roundResults, result],
        }));
      } else {
        setState((prev) => ({
          ...prev,
          phase: "inputting",
          score: newScore,
          lives: newLives,
          combo: newCombo,
          maxCombo: newMaxCombo,
          multiplier: newMultiplier,
          inputIndex: newInputIndex,
          attempts: newAttempts,
          inputStartTime,
          expectedTimes,
        }));
      }

      return { correct, expected };
    },
    [] // uses refs only
  );

  // ── Next round (or session end) ─────────────────────────────────────────────
  const nextRound = useCallback(() => {
    const pack = packRef.current;
    const s = stateRef.current;
    if (!pack) return;

    const nextIndex = s.melodyIndex + 1;

    if (nextIndex >= pack.melodies.length) {
      // All melodies done — check for unlock
      const allResults = s.roundResults;
      const avgAcc =
        allResults.length > 0
          ? Math.round(allResults.reduce((t, r) => t + r.noteAccuracy, 0) / allResults.length)
          : 0;

      const packIndex = MELODY_PACKS.findIndex((p) => p.id === pack.id);
      const nextPack = MELODY_PACKS[packIndex + 1];
      let newlyUnlocked: string | null = null;
      let newUnlockedPacks = s.unlockedPacks;

      if (nextPack && !s.unlockedPacks.includes(nextPack.id) && avgAcc >= nextPack.unlockAccuracy) {
        newUnlockedPacks = [...s.unlockedPacks, nextPack.id];
        newlyUnlocked = nextPack.id;
        try {
          localStorage.setItem("alpha-melody-unlocks", JSON.stringify(newUnlockedPacks));
        } catch {}
      }

      setState((prev) => ({
        ...prev,
        phase: "session_end",
        unlockedPacks: newUnlockedPacks,
        newlyUnlocked,
      }));
      return;
    }

    const maxLives = LIVES_BY_DIFF[pack.difficulty] ?? 3;
    setState((prev) => ({
      ...prev,
      phase: "listening",
      countdown: 0,
      melodyIndex: nextIndex,
      lives: maxLives,
      combo: 0,
      multiplier: 1,
      attempts: [],
      inputIndex: 0,
      expectedTimes: [],
      replayTrigger: 0,
    }));
  }, []);

  // ── Replay current melody (go back to listening) ────────────────────────────
  const replayMelody = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "listening",
      countdown: 0,
      combo: 0,
      multiplier: 1,
      attempts: [],
      inputIndex: 0,
      expectedTimes: [],
      replayTrigger: prev.replayTrigger + 1,
    }));
  }, []);

  // ── Toggle slow mode ─────────────────────────────────────────────────────────
  const toggleSlowMode = useCallback(() => {
    setState((prev) => ({ ...prev, slowMode: !prev.slowMode }));
  }, []);

  // ── Full reset ───────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      unlockedPacks: prev.unlockedPacks,
    }));
  }, []);

  // ── Session stats (computed) ─────────────────────────────────────────────────
  const sessionAccuracy =
    state.roundResults.length > 0
      ? Math.round(
          state.roundResults.reduce((t, r) => t + r.noteAccuracy, 0) /
            state.roundResults.length
        )
      : 0;

  const sessionTimingAccuracy =
    state.roundResults.length > 0
      ? Math.round(
          state.roundResults.reduce((t, r) => t + r.timingAccuracy, 0) /
            state.roundResults.length
        )
      : 0;

  return {
    state,
    currentPack,
    currentMelody,
    sessionAccuracy,
    sessionTimingAccuracy,
    selectPack,
    startCountdown,
    tickCountdown,
    onListeningComplete,
    submitNote,
    nextRound,
    replayMelody,
    toggleSlowMode,
    reset,
    PACKS: MELODY_PACKS,
  };
}
