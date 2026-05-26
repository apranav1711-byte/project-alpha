"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import type { SongMetadata, ParsedMidiNote, LibraryPhase, LibraryNoteAttempt, LibraryRoundResult, LibraryRecentHistory } from "../types";
import type { NoteName } from "../../../training/types";
import { PRELOADED_SONGS } from "../data/songs";
import { getLibraryHistoryKey } from "../../../profile/utils/userState";

export interface GameplayState {
  phase: LibraryPhase;
  selectedSong: SongMetadata | null;
  inputIndex: number;
  attempts: LibraryNoteAttempt[];
  score: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  lives: number;
  maxLives: number;
  inputStartTime: number;
  tempoSpeed: number; // 0.5x to 1.5x
  loopSegmentName: string; // e.g. "Full Song"
  unlockedSongs: string[];
  favorites: string[];
  recentHistory: LibraryRecentHistory[];
  activePreviewNote: NoteName | null;
  replayTrigger: number;
  roundResultsHistory?: LibraryRoundResult[];
  customSongs: SongMetadata[];
  practiceHand: "left" | "right" | "both";
}

const INITIAL_STATE: GameplayState = {
  phase: "idle",
  selectedSong: null,
  inputIndex: 0,
  attempts: [],
  score: 0,
  combo: 0,
  maxCombo: 0,
  multiplier: 1,
  lives: 3,
  maxLives: 3,
  inputStartTime: 0,
  tempoSpeed: 1.0,
  loopSegmentName: "Full Song",
  unlockedSongs: ["ode_to_joy", "twinkle_twinkle"], // starting unlocked songs
  favorites: [],
  recentHistory: [],
  activePreviewNote: null,
  replayTrigger: 0,
  roundResultsHistory: [],
  customSongs: [],
  practiceHand: "both",
};

export function useLibraryGameplay() {
  const [state, setState] = useState<GameplayState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load persistent stats from localStorage on mount
  useEffect(() => {
    try {
      const savedUnlocks = localStorage.getItem("alpha-library-unlocks");
      const savedFavs = localStorage.getItem("alpha-library-favorites");
      const libraryKey = getLibraryHistoryKey();
      const savedHistory = localStorage.getItem(libraryKey);

      setState((prev) => ({
        ...prev,
        unlockedSongs: savedUnlocks ? JSON.parse(savedUnlocks) : prev.unlockedSongs,
        favorites: savedFavs ? JSON.parse(savedFavs) : [],
        recentHistory: savedHistory ? JSON.parse(savedHistory) : [],
      }));
    } catch {}
  }, []);

  // Update localStorage helper
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  };

  // Toggle Favorite Status
  const toggleFavorite = useCallback((songId: string) => {
    setState((prev) => {
      const isFav = prev.favorites.includes(songId);
      const newFavs = isFav
        ? prev.favorites.filter((id) => id !== songId)
        : [...prev.favorites, songId];
      saveToStorage("alpha-library-favorites", newFavs);
      return { ...prev, favorites: newFavs };
    });
  }, []);

  // Set Tempo Speed multiplier
  const changeTempo = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, tempoSpeed: speed }));
  }, []);

  // Select Loop Segment
  const changeLoopSegment = useCallback((segmentName: string) => {
    setState((prev) => ({ ...prev, loopSegmentName: segmentName }));
  }, []);

  // Select Song
  const selectSong = useCallback((song: SongMetadata) => {
    const isUnlocked = stateRef.current.unlockedSongs.includes(song.id) || song.isCustom;
    if (!isUnlocked) return;

    setState((prev) => ({
      ...prev,
      selectedSong: song,
      phase: "idle",
      inputIndex: 0,
      attempts: [],
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      lives: 3,
      maxLives: 3,
      replayTrigger: 0,
    }));
  }, []);

  // Start Gameplay Listening Phase
  const startListening = useCallback(() => {
    const song = stateRef.current.selectedSong;
    if (!song) return;

    setState((prev) => ({
      ...prev,
      phase: "listening",
      inputIndex: 0,
      attempts: [],
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      lives: 3,
      maxLives: 3,
    }));
  }, []);

  // Replay sequence
  const replaySequence = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "listening",
      inputIndex: 0,
      attempts: [],
      replayTrigger: prev.replayTrigger + 1,
    }));
  }, []);

  // Transition from Listening complete to Input phase
  const startInputPhase = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "inputting",
      inputStartTime: Date.now(),
      inputIndex: 0,
      attempts: [],
    }));
  }, []);

  // Reset Session back to Song Browser
  const exitToBrowser = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "idle",
      selectedSong: null,
      inputIndex: 0,
      attempts: [],
    }));
  }, []);

  // Submit Note Guess & Calculate Rhythmic/Duration score
  const submitNoteGuess = useCallback((
    note: NoteName,
    keydownTime: number,
    durationMs = 350
  ): { correct: boolean; expected: NoteName } => {
    const s = stateRef.current;
    const song = s.selectedSong;

    if (!song) return { correct: false, expected: "C" };

    const songNotes = s.practiceHand === "both"
      ? song.notes
      : song.notes.filter((n) => n.hand === s.practiceHand);

    if ((s.phase !== "inputting" && s.phase !== "listening") || s.inputIndex >= songNotes.length) {
      return { correct: false, expected: "C" };
    }

    const isInterrupt = s.phase === "listening";
    const currentInputIndex = isInterrupt ? 0 : s.inputIndex;
    const currentAttempts = isInterrupt ? [] : s.attempts;
    const inputStartTime = isInterrupt ? keydownTime : s.inputStartTime;

    const expectedNote = songNotes[currentInputIndex];
    const correct = note === expectedNote.note;

    // Calculate timing offset
    const speedMult = s.tempoSpeed;
    const actualTimeElapsed = (keydownTime - inputStartTime) / 1000;
    
    // Offset standard: relative note start offset from first note of active set
    const firstNoteTime = songNotes[0]?.time ?? 0;
    const expectedTimeElapsed = (expectedNote.time - firstNoteTime) / speedMult;

    const timeOffsetMs = Math.round((actualTimeElapsed - expectedTimeElapsed) * 1000);
    
    // Rhythm Timing Score: perfect within 100ms, decreases exponentially
    const timingScore = Math.max(0, Math.round(100 - Math.min(100, Math.abs(timeOffsetMs) / 3)));

    // Duration Score: hold length checking
    const expectedDurationMs = (expectedNote.duration / speedMult) * 1000;
    const durationOffsetMs = Math.round(durationMs - expectedDurationMs);
    const durationScore = Math.max(0, Math.round(100 - Math.min(100, Math.abs(durationOffsetMs) / 5)));

    const attempt: LibraryNoteAttempt = {
      index: currentInputIndex,
      expected: expectedNote.note,
      played: note,
      correct,
      timeOffsetMs,
      durationOffsetMs,
      timingScore,
      durationScore,
    };

    // Calculate dynamic scores & multipliers
    const newCombo = correct ? s.combo + 1 : 0;
    const newMaxCombo = Math.max(s.maxCombo, newCombo);
    const newMultiplier = Math.min(5, 1 + Math.floor(newCombo / 5));
    
    // Note score incorporates rhythm accuracy
    const basePoints = correct ? 100 : 0;
    const bonusPoints = correct ? Math.round((timingScore + durationScore) * 0.25) : 0;
    const noteScore = (basePoints + bonusPoints) * newMultiplier;

    const newScore = s.score + noteScore;
    const newLives = s.lives;
    const newInputIndex = currentInputIndex + 1;
    const newAttempts = [...currentAttempts, attempt];

    const isRoundDone = newInputIndex >= songNotes.length;

    if (isRoundDone) {
      // Calculate final percentages
      const correctAttempts = newAttempts.filter((a) => a.correct);
      const accuracy = newAttempts.length > 0 
        ? Math.round((correctAttempts.length / newAttempts.length) * 100)
        : 0;

      const timingAccuracy = newAttempts.length > 0
        ? Math.round(newAttempts.reduce((sum, a) => sum + a.timingScore, 0) / newAttempts.length)
        : 0;

      const durationAccuracy = newAttempts.length > 0
        ? Math.round(newAttempts.reduce((sum, a) => sum + a.durationScore, 0) / newAttempts.length)
        : 0;

      // Grade classification (S/A/B/C/D)
      let grade: "S" | "A" | "B" | "C" | "D" = "D";
      if (accuracy >= 95 && timingAccuracy >= 90) grade = "S";
      else if (accuracy >= 85) grade = "A";
      else if (accuracy >= 70) grade = "B";
      else if (accuracy >= 50) grade = "C";

      const roundResult: LibraryRoundResult = {
        songId: song.id,
        songTitle: song.title,
        attempts: newAttempts,
        score: newScore,
        accuracy,
        timingAccuracy,
        durationAccuracy,
        maxCombo: newMaxCombo,
        missedCount: newAttempts.length - correctAttempts.length,
        grade,
        completedAt: Date.now(),
      };

      // PROGRESSION UNLOCK LOGIC: Complete active song with >= 80% accuracy
      let nextUnlockedSongs = [...s.unlockedSongs];
      if (accuracy >= 80) {
        if (song.id === "ode_to_joy" || song.id === "twinkle_twinkle") {
          // Unlock Minuet in G and Amazing Grace
          if (!nextUnlockedSongs.includes("minuet_in_g")) nextUnlockedSongs.push("minuet_in_g");
          if (!nextUnlockedSongs.includes("amazing_grace")) nextUnlockedSongs.push("amazing_grace");
        } else if (song.id === "minuet_in_g" || song.id === "amazing_grace") {
          // Unlock Canon in D
          if (!nextUnlockedSongs.includes("canon_in_d")) nextUnlockedSongs.push("canon_in_d");
        }
        saveToStorage("alpha-library-unlocks", nextUnlockedSongs);
      }

      // Add to recent history
      const historyItem: LibraryRecentHistory = {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        difficulty: song.difficulty,
        playedAt: Date.now(),
        accuracy,
        score: newScore,
      };

      const libraryKey = getLibraryHistoryKey();
      const nextHistory = [historyItem, ...s.recentHistory.slice(0, 9)];
      saveToStorage(libraryKey, nextHistory);

      // Add XP reward for completing a song in the library
      try {
        let xpReward = Math.round(accuracy * 1.5 + newScore / 100);
        if (accuracy >= 90) xpReward += 150; // excellence bonus
        else if (accuracy >= 70) xpReward += 50; // pass bonus
        xpReward = Math.max(20, xpReward); // minimum 20 XP for effort
        
        import("../../../profile/utils/userState").then(({ addXP }) => {
          addXP(xpReward);
        });
      } catch (err) {
        console.error("Failed to add XP on melody completion:", err);
      }

      setState((prev) => ({
        ...prev,
        phase: "result",
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        multiplier: newMultiplier,
        lives: newLives,
        attempts: newAttempts,
        inputIndex: newInputIndex,
        unlockedSongs: nextUnlockedSongs,
        recentHistory: nextHistory,
        roundResultsHistory: prev.roundResultsHistory ? [...prev.roundResultsHistory, roundResult] : [roundResult],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        phase: "inputting",
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        multiplier: newMultiplier,
        lives: newLives,
        attempts: newAttempts,
        inputIndex: newInputIndex,
        inputStartTime,
      }));
    }

    return { correct, expected: expectedNote.note };
  }, []);

  // Add custom community-uploaded MIDI song
  const addCustomMidiSong = useCallback((newSong: SongMetadata) => {
    setState((prev) => {
      const nextRecent = prev.recentHistory; // keep same
      // Add custom song identifier so we load it
      return {
        ...prev,
        selectedSong: newSong,
        phase: "idle",
      };
    });
  }, []);

  // Change active practice hand (left/right/both) and reset round state
  const changePracticeHand = useCallback((hand: "left" | "right" | "both") => {
    setState((prev) => ({
      ...prev,
      practiceHand: hand,
      inputIndex: 0,
      attempts: [],
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      lives: 3,
      maxLives: 3,
      replayTrigger: prev.replayTrigger + 1, // reload playing timeline
    }));
  }, []);

  return {
    state,
    selectSong,
    changeTempo,
    changeLoopSegment,
    toggleFavorite,
    startListening,
    startInputPhase,
    submitNoteGuess,
    replaySequence,
    exitToBrowser,
    addCustomMidiSong,
    changePracticeHand,
    PRELOADED_SONGS,
  };
}
export type LibraryGameplayEngine = ReturnType<typeof useLibraryGameplay>;
