"use client";
import React, { useEffect, useState } from "react";

export default function SimulatedAuthPage() {
  const [provider, setProvider] = useState<"github" | "google">("github");
  const [isLoading, setIsLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState("");

  useEffect(() => {
    // Read query parameters
    const params = new URLSearchParams(window.location.search);
    const p = params.get("provider") as "github" | "google";
    if (p === "google" || p === "github") {
      setProvider(p);
      setUsernameInput(p === "github" ? "git_virtuoso" : "melody_master@gmail.com");
    }

    // Simulate small latency
    const tid = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(tid);
  }, []);

  const handleAuthorize = () => {
    if (!usernameInput.trim()) return;

    // Pick avatar color based on name
    const colors = ["#4cd7f6", "#e2b714", "#ff7a50", "#34d399", "#a855f7"];
    const charCodeSum = usernameInput.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const color = colors[charCodeSum % colors.length];
    
    const mockAvatarUrl = `avatar_color:${color}`;

    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "AUTH_SUCCESS",
          provider,
          username: usernameInput.trim(),
          avatarUrl: mockAvatarUrl,
        },
        window.location.origin
      );
    }
    
    // Close the popup window automatically
    window.close();
  };

  const handleCancel = () => {
    window.close();
  };

  const brandColor = provider === "github" ? "#24292e" : "#4285f4";
  const brandName = provider === "github" ? "GitHub" : "Google";
  const brandIcon = provider === "github" ? "terminal" : "account_circle";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1115",
        color: "#e2e1ef",
        fontFamily: "'JetBrains Mono', monospace",
        padding: 24,
      }}
    >
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 48,
              color: brandColor,
              animation: "timerPulse 1s infinite alternate",
            }}
          >
            {brandIcon}
          </span>
          <div style={{ fontSize: 13, color: "#8e90a2" }}>
            Connecting to {brandName} OAuth...
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#161b22",
            border: "1px solid #30363d",
            borderRadius: 12,
            padding: 32,
            maxWidth: 400,
            width: "100%",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid #30363d", paddingBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: brandColor }}>
                {brandIcon}
              </span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{brandName} Auth</span>
            </div>
            <span style={{ fontSize: 11, color: "#8e90a2", textTransform: "uppercase" }}>secure sandbox</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: 12, color: "#8e90a2", lineHeight: 1.5, marginBottom: 20 }}>
            <strong style={{ color: "#e2e1ef" }}>Project Alpha Ear Training</strong> requests permission to view your identity profile and link it to your training progress.
          </p>

          {/* Username Input Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: "#8e90a2" }}>CHOOSE ACCOUNT USERNAME</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter profile username"
              style={{
                background: "#0f1115",
                border: "1px solid #30363d",
                color: "#e2e1ef",
                borderRadius: 6,
                padding: "10px 12px",
                fontSize: 13,
                outline: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleAuthorize}
              style={{
                background: brandColor,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "12px 0",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "opacity 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              <span>Authorize Project Alpha</span>
            </button>

            <button
              onClick={handleCancel}
              style={{
                background: "transparent",
                color: "#8e90a2",
                border: "1px solid #30363d",
                borderRadius: 6,
                padding: "10px 0",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#ff6b6b"; e.currentTarget.style.borderColor = "#ff6b6b"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#8e90a2"; e.currentTarget.style.borderColor = "#30363d"; }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
