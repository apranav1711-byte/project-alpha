"use client";
import { useEffect, useRef } from "react";
import { KEY_TO_NOTE, type NoteName } from "../types";

/**
 * Always-active keyboard handler.
 * onPress fires for EVERY valid note key (so notes always sound).
 * canGuess controls whether a guess callback fires — false during feedback
 * phase so the sound plays but no guess is submitted.
 * onReplay fires when the user presses R (replay current note).
 */
export function useKeyboard(
  onPress: (note: NoteName) => void,
  canGuess: boolean,
  onGuess: (note: NoteName) => void,
  onReplay?: () => void
) {
  // Keep latest callbacks in refs so we never need to re-attach the listener
  const onPressRef = useRef(onPress);
  const onGuessRef = useRef(onGuess);
  const canGuessRef = useRef(canGuess);
  const onReplayRef = useRef(onReplay);

  onPressRef.current = onPress;
  onGuessRef.current = onGuess;
  canGuessRef.current = canGuess;
  onReplayRef.current = onReplay;

  useEffect(() => {
    const held = new Set<string>(); // prevent key-repeat spam

    const handleDown = (e: KeyboardEvent) => {
      // Ignore if user is in a text field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const k = e.key.toUpperCase();
      if (held.has(k)) return; // key-repeat — ignore
      held.add(k);

      // R key — replay current note
      if (k === "R") {
        e.preventDefault();
        onReplayRef.current?.();
        return;
      }

      const note = KEY_TO_NOTE[k];
      if (!note) return;

      e.preventDefault();

      // ALWAYS play the note sound
      onPressRef.current(note);

      // Only submit a guess when the game allows it
      if (canGuessRef.current) {
        onGuessRef.current(note);
      }
    };

    const handleUp = (e: KeyboardEvent) => {
      held.delete(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      held.clear();
    };
  }, []); // mount/unmount only — refs handle fresh values
}
