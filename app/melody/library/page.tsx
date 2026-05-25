"use client";
import React, { useEffect, useState, useCallback } from "react";
import SideNav from "../../components/SideNav";
import TopNav from "../../components/TopNav";
import { useLibraryGameplay } from "./hooks/useLibraryGameplay";
import { useToneSynthesizer } from "./hooks/useToneSynthesizer";
import { useKeyboard } from "../../training/hooks/useKeyboard";
import SongBrowser from "./components/SongBrowser";
import GameplayView from "./components/GameplayView";
import AnalyticsResult from "./components/AnalyticsResult";
import type { NoteName } from "../../training/types";

export default function MelodyLibraryPage() {
  const engine = useLibraryGameplay();
  const synth = useToneSynthesizer();

  const { state } = engine;
  const { selectedSong, phase, unlockedSongs, favorites, recentHistory, loopSegmentName, tempoSpeed, replayTrigger, practiceHand } = state;

  // Active key visualization
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());

  const flashKey = useCallback((note: string, dur = 200) => {
    setActiveKeys((prev) => new Set([...prev, note]));
    setTimeout(() => setActiveKeys((prev) => {
      const s = new Set(prev);
      s.delete(note);
      return s;
    }), dur);
  }, []);

  // Wires keyboard inputs
  const handleKeyboardInput = useCallback((note: NoteName) => {
    if (phase !== "inputting" && phase !== "listening") return;

    if (phase === "listening") {
      synth.stopPlayback();
    }

    engine.submitNoteGuess(note, Date.now(), 300);
  }, [phase, engine, synth]);

  useKeyboard(
    (note: NoteName) => {
      synth.playNote(note);
      const keyMap: Record<string, string> = {
        C: "A", "C#": "W", Db: "W", D: "S", "D#": "E", Eb: "E", E: "D",
        F: "F", "F#": "T", Gb: "T", G: "G", "G#": "Y", Ab: "Y",
        A: "H", "A#": "U", Bb: "U", B: "J",
      };
      const k = keyMap[note];
      if (k) flashKey(k, 200);
    },
    phase === "inputting" || phase === "listening",
    handleKeyboardInput,
    () => {
      if (phase === "inputting" || phase === "listening" || phase === "result") {
        synth.stopPlayback();
        engine.replaySequence();
      }
    }
  );

  // Determine loop segment boundaries
  const activeSegment = selectedSong?.segments.find(
    (s) => s.name === loopSegmentName
  ) || null;

  // Trigger playing effect when phase becomes 'listening' or replayTrigger is incremented
  useEffect(() => {
    if (phase !== "listening" || !selectedSong) return;

    synth.stopPlayback();

    synth.playSongSequence(
      selectedSong,
      activeSegment,
      tempoSpeed,
      false, // non-looping play sequence for validation
      practiceHand,
      () => {
        engine.startInputPhase();
      }
    );

    return () => {
      synth.stopPlayback();
    };
  }, [phase, selectedSong, replayTrigger, tempoSpeed, loopSegmentName, practiceHand]);

  // Clean up playback on component unmount
  useEffect(() => {
    return () => {
      synth.stopPlayback();
    };
  }, []);

  return (
    <>
      <TopNav />
      <SideNav />

      <main
        className="md:ml-64"
        style={{
          paddingTop: 72,
          paddingBottom: 48,
          paddingLeft: 40,
          paddingRight: 40,
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        {/* Lush grand piano sample loading indicator */}
        {!synth.isLoaded && (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--bg-border)",
              borderRadius: 10,
              padding: "12px 18px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
              animation: "fadeInDown 0.3s ease forwards",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 18,
                color: "var(--accent)",
                animation: "timerPulse 1.2s infinite alternate",
              }}
            >
              hourglass_empty
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: "var(--text-sub)",
              }}
            >
              Loading high-fidelity acoustic piano samples...
            </span>
          </div>
        )}

        {/* Phase 1: Song Browser */}
        {phase === "idle" && !selectedSong && (
          <SongBrowser
            songs={engine.PRELOADED_SONGS}
            unlockedSongs={unlockedSongs}
            favorites={favorites}
            recentHistory={recentHistory}
            toggleFavorite={engine.toggleFavorite}
            onSelectSong={engine.selectSong}
            onAddCustomSong={engine.addCustomMidiSong}
          />
        )}

        {/* Phase 2: Active Gameplay Practicing */}
        {(phase === "idle" || phase === "listening" || phase === "inputting") && selectedSong && (
          <GameplayView
            song={selectedSong}
            phase={phase}
            score={state.score}
            combo={state.combo}
            multiplier={state.multiplier}
            lives={state.lives}
            maxLives={state.maxLives}
            inputIndex={state.inputIndex}
            attempts={state.attempts}
            tempoSpeed={tempoSpeed}
            loopSegmentName={loopSegmentName}
            metronomeOn={synth.metronomeOn}
            isPlayingPreview={synth.isPlaying}
            activePreviewNoteIdx={synth.activeNoteIdx}
            onStartListening={engine.startListening}
            onReplay={() => {
              synth.stopPlayback();
              engine.replaySequence();
            }}
            onToggleMetronome={synth.toggleMetronome}
            onChangeTempo={engine.changeTempo}
            onChangeLoopSegment={engine.changeLoopSegment}
            onExit={engine.exitToBrowser}
            onPlayKeyboardNote={(note) => {
              synth.playNote(note as NoteName);
              handleKeyboardInput(note as NoteName);
            }}
            activeKeys={activeKeys}
            practiceHand={practiceHand}
            onChangePracticeHand={engine.changePracticeHand}
          />
        )}

        {/* Phase 3: Post-Round circular analytics result */}
        {phase === "result" && selectedSong && (
          <AnalyticsResult
            song={selectedSong}
            attempts={state.attempts}
            score={state.score}
            unlockedSongs={unlockedSongs}
            onRetry={() => {
              synth.stopPlayback();
              engine.selectSong(selectedSong);
            }}
            onExit={engine.exitToBrowser}
          />
        )}
      </main>
    </>
  );
}
