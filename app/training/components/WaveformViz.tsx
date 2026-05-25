"use client";
import { useEffect, useRef, useState } from "react";
import { type FeedbackKind } from "../types";

interface Props {
  active: boolean;
  feedback?: FeedbackKind | null;
}

/** Animated waveform that reacts to game phase and feedback */
export function WaveformViz({ active, feedback }: Props) {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 52 }, () => Math.random() * 55 + 15)
  );
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const animate = (ts: number) => {
      if (ts - lastRef.current > 100) {
        lastRef.current = ts;
        setBars((prev) =>
          prev.map((h, i) => {
            const wave = Math.sin(ts / 700 + i * 0.38) * 28;
            const rand = Math.random() * 18;
            return Math.max(6, Math.min(98, h + (wave + rand - 14) * 0.55));
          })
        );
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  const barColor =
    feedback === "correct"
      ? "linear-gradient(to top, #4cd7f6, rgba(76,215,246,0.2))"
      : feedback === "wrong"
      ? "linear-gradient(to top, #ff6b6b, rgba(255,107,107,0.2))"
      : "linear-gradient(to top, #4cd7f6, rgba(76,215,246,0))";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        height: 72,
        display: "flex",
        alignItems: "flex-end",
        gap: 2,
        opacity: active ? 0.8 : 0.15,
        transition: "opacity 0.5s",
      }}
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            background: barColor,
            borderRadius: "2px 2px 0 0",
            transition: "height 0.1s ease, background 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}
