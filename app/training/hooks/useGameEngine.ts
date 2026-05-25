"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  NATURAL_NOTES, SHARP_NOTES, FLAT_NOTES, ENHARMONIC_MAP, DEFAULT_CONFIG,
  type NoteName, type GameState, type GameConfig,
  type FeedbackKind, type HistoryEntry,
} from "../types";

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "START"; note: NoteName }
  | { type: "TICK" }
  | { type: "GUESS"; note: NoteName }
  | { type: "ADVANCE"; note: NoteName }
  | { type: "END" }
  | { type: "RESET" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

const INITIAL: GameState = {
  phase: "idle",
  currentNote: null,
  score: 0,
  combo: 0,
  maxCombo: 0,
  totalAttempts: 0,
  correctAttempts: 0,
  timeLeft: DEFAULT_CONFIG.duration,
  feedback: null,
  lastGuess: null,
  history: [],
};

function makeInitial(duration: number): GameState {
  return { ...INITIAL, timeLeft: duration };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return {
        ...makeInitial(state.timeLeft > 0 ? state.timeLeft : DEFAULT_CONFIG.duration),
        phase: "playing",
        currentNote: action.note,
        feedback: null,
        lastGuess: null,
      };

    case "TICK": {
      const next = state.timeLeft - 1;
      if (next <= 0) return { ...state, timeLeft: 0, phase: "ended" };
      return { ...state, timeLeft: next };
    }

    case "GUESS": {
      if (state.phase !== "playing" || !state.currentNote) return state;
      const correct = ENHARMONIC_MAP[action.note] === ENHARMONIC_MAP[state.currentNote];
      const newCombo = correct ? state.combo + 1 : 0;
      // Scoring: 10 base + 5 per existing combo streak
      const points = correct ? 10 + state.combo * 5 : 0;
      const entry: HistoryEntry = {
        target: state.currentNote,
        guess: action.note,
        correct,
        points,
      };
      return {
        ...state,
        phase: "feedback",
        score: state.score + points,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        totalAttempts: state.totalAttempts + 1,
        correctAttempts: state.correctAttempts + (correct ? 1 : 0),
        feedback: correct ? "correct" : "wrong",
        lastGuess: action.note,
        history: [...state.history, entry],
      };
    }

    case "ADVANCE":
      return {
        ...state,
        phase: "playing",
        currentNote: action.note,
        feedback: null,
        lastGuess: null,
      };

    case "END":
      return { ...state, phase: "ended" };

    case "RESET":
      return makeInitial(DEFAULT_CONFIG.duration);

    default:
      return state;
  }
}

// ─── Note Picker — anti-repetition ───────────────────────────────────────────

export function pickNote(config: GameConfig, recent: NoteName[]): NoteName {
  const pool: NoteName[] = [];
  if (config.practiceNatural) pool.push(...NATURAL_NOTES);
  if (config.practiceSharp) pool.push(...SHARP_NOTES);
  if (config.practiceFlat) pool.push(...FLAT_NOTES);
  const finalPool = pool.length > 0 ? pool : NATURAL_NOTES;
  const filtered = finalPool.filter((n) => !recent.slice(-2).includes(n));
  const source = filtered.length > 0 ? filtered : finalPool;
  return source[Math.floor(Math.random() * source.length)];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface GameCallbacks {
  onPlayNote: (note: NoteName) => void;
  onCorrect: () => void;
  onWrong: () => void;
}

export function useGameEngine(
  config: GameConfig = DEFAULT_CONFIG,
  callbacks: GameCallbacks
) {
  const [state, dispatch] = useReducer(reducer, makeInitial(config.duration));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recentRef = useRef<NoteName[]>([]);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks; // always up-to-date without re-subscribing

  const clearAll = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
  }, []);

  const spawnNote = useCallback((): NoteName => {
    const n = pickNote(config, recentRef.current);
    recentRef.current = [...recentRef.current.slice(-3), n];
    return n;
  }, [config]);

  // ── Start ──
  const start = useCallback(() => {
    clearAll();
    recentRef.current = [];
    const note = spawnNote();
    dispatch({ type: "START", note });
    callbacksRef.current.onPlayNote(note);

    timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
  }, [clearAll, spawnNote]);

  // ── Guess ──
  const guess = useCallback(
    (note: NoteName) => {
      if (state.phase !== "playing") return;
      dispatch({ type: "GUESS", note });

      const correct = state.currentNote ? ENHARMONIC_MAP[note] === ENHARMONIC_MAP[state.currentNote] : false;
      if (correct) callbacksRef.current.onCorrect();
      else callbacksRef.current.onWrong();

      feedbackRef.current = setTimeout(() => {
        const next = spawnNote();
        dispatch({ type: "ADVANCE", note: next });
        callbacksRef.current.onPlayNote(next);
      }, correct ? 1000 : 2000);
    },
    [state.phase, state.currentNote, spawnNote]
  );

  // ── Replay ──
  const replay = useCallback(() => {
    if (state.currentNote) callbacksRef.current.onPlayNote(state.currentNote);
  }, [state.currentNote]);

  // ── Reset ──
  const reset = useCallback(() => {
    clearAll();
    recentRef.current = [];
    dispatch({ type: "RESET" });
  }, [clearAll]);

  // Auto-stop timer when game ends
  useEffect(() => {
    if (state.phase === "ended") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [state.phase]);

  // Cleanup on unmount
  useEffect(() => () => clearAll(), [clearAll]);

  const accuracy =
    state.totalAttempts > 0
      ? Math.round((state.correctAttempts / state.totalAttempts) * 100)
      : 0;

  return { state, accuracy, start, guess, replay, reset };
}
