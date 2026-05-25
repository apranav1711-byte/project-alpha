"use client";
import React, { useState, useRef, useCallback } from "react";
import { parseMidiBuffer } from "../utils/midiParser";
import type { SongMetadata } from "../types";

interface Props {
  onSongParsed: (song: SongMetadata) => void;
}

export default function MidiUploader({ onSongParsed }: Props) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse file content array buffer
  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".mid") && !file.name.endsWith(".midi")) {
      setUploadStatus({ type: "error", text: "Please upload a valid MIDI file (.mid or .midi)" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setUploadStatus({ type: "error", text: "Failed to read file buffer." });
        return;
      }

      try {
        const parsedSong = parseMidiBuffer(buffer, file.name);
        onSongParsed(parsedSong);
        setUploadStatus({
          type: "success",
          text: `Parsed successfully: ${parsedSong.title} (${parsedSong.noteCount} notes, Tier ${parsedSong.difficulty})!`,
        });
      } catch (err) {
        console.error(err);
        setUploadStatus({ type: "error", text: "Error parsing MIDI: Make sure it contains valid note tracks." });
      }
    };

    reader.onerror = () => {
      setUploadStatus({ type: "error", text: "File reading error." });
    };

    reader.readAsArrayBuffer(file);
  }, [onSongParsed]);

  // Drag listeners
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${isDragActive ? "var(--accent)" : "var(--bg-border)"}`,
        backgroundColor: isDragActive ? "rgba(226, 183, 20, 0.05)" : "var(--bg-surface)",
        borderRadius: 12,
        padding: "20px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        height: "100%",
        minHeight: 156,
        transition: "border-color 0.15s, background-color 0.15s",
        position: "relative",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        onChange={handleFileChange}
        accept=".mid,.midi"
        style={{ display: "none" }}
      />

      <span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--accent)" }}>
        upload_file
      </span>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
        Import Custom MIDI File
      </div>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", margin: 0 }}>
        Drag and drop `.mid` or click below to parse in-browser
      </p>

      <button
        onClick={onButtonClick}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          padding: "6px 14px",
          background: "var(--bg-raised)",
          border: "1px solid var(--bg-border)",
          color: "var(--text-sub)",
          borderRadius: 6,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bg-border)"; e.currentTarget.style.color = "var(--text-sub)"; }}
      >
        Select File
      </button>

      {uploadStatus && (
        <div
          style={{
            marginTop: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: uploadStatus.type === "success" ? "var(--correct)" : "var(--wrong)",
            lineHeight: 1.3,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {uploadStatus.text}
        </div>
      )}
    </div>
  );
}
