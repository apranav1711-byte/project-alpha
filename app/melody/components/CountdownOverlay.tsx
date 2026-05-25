"use client";
import { useEffect, useRef } from "react";

interface Props {
  value: number; // 3 → 2 → 1 → 0 (0 = "GO!")
}

export default function CountdownOverlay({ value }: Props) {
  const label = value === 0 ? "GO!" : String(value);
  const keyRef = useRef(0);
  keyRef.current += 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* Pulsing ring */}
      <div
        key={keyRef.current}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "3px solid var(--accent)",
            opacity: 0,
            animation: "countdownRing 0.9s ease-out forwards",
          }}
        />
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "var(--bg-raised)",
            border: "2px solid var(--bg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <span
            key={label}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: value === 0 ? 32 : 64,
              fontWeight: 700,
              color: value === 0 ? "var(--correct)" : "var(--accent)",
              letterSpacing: "-0.04em",
              animation: "countdownPop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            {label}
          </span>
          {value > 0 && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                marginTop: 4,
              }}
            >
              get ready
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes countdownRing {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes countdownPop {
          0%   { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
