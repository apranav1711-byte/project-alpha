"use client";
import React from "react";
import { signIn } from "next-auth/react";
import { loginAsGuest } from "../utils/userState";

export default function AuthModal() {
  const handleSignIn = (provider: "github" | "google") => {
    signIn(provider, { callbackUrl: "/profile" });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        animation: "fadeInUp 0.35s ease forwards",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--bg-border)",
          borderRadius: 16,
          padding: "40px 48px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand Icon & Heading */}
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 48,
            color: "var(--accent)",
            marginBottom: 16,
            display: "inline-block",
            animation: "timerPulse 2s infinite alternate",
          }}
        >
          graphic_eq
        </span>

        <h2
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Account Login
        </h2>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          Log in to synchronize your training stats, unlock global badges, and track your ear-training accuracy over time.
        </p>

        {/* Buttons List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* GitHub OAuth Button */}
          <button
            onClick={() => handleSignIn("github")}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              padding: "13px 0",
              background: "#24292e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 0.15s, opacity 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>terminal</span>
            <span>Sign in with GitHub</span>
          </button>

          {/* Google OAuth Button */}
          <button
            onClick={() => handleSignIn("google")}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              padding: "13px 0",
              background: "#fff",
              color: "#3c4043",
              border: "1px solid #dadce0",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#4285f4" }}>account_circle</span>
            <span>Sign in with Google</span>
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--bg-border)" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--bg-border)" }} />
          </div>

          {/* Guest Button */}
          <button
            onClick={loginAsGuest}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
              padding: "13px 0",
              background: "var(--bg-raised)",
              color: "var(--text-sub)",
              border: "1px solid var(--bg-border)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.color = "var(--text-sub)"; }}
          >
            Practice as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
