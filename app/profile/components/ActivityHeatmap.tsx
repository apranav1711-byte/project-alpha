"use client";
import React, { useState, useMemo } from "react";
import { getTrainingHistoryKey, getLibraryHistoryKey } from "../utils/userState";

interface HeatmapDay {
  date: Date;
  dateStr: string;   // YYYY-MM-DD
  sessions: number;  // Number of sessions completed on this day
  label: string;     // Friendly hover label
}

export default function ActivityHeatmap() {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 1. Fetch real session volumes over the last 365 days
  const activityData = useMemo(() => {
    const activityMap: Record<string, number> = {};
    let hasRealSessions = false;

    if (typeof window !== "undefined") {
      const trainingKey = getTrainingHistoryKey();
      const libraryKey = getLibraryHistoryKey();

      // Read Melody Library History
      try {
        const libSaved = localStorage.getItem(libraryKey);
        if (libSaved) {
          const history = JSON.parse(libSaved);
          history.forEach((h: any) => {
            const d = new Date(h.playedAt || Date.now());
            const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            hasRealSessions = true;
          });
        }
      } catch {}

      // Read Standard Trainer History
      try {
        const trSaved = localStorage.getItem(trainingKey);
        if (trSaved) {
          const history = JSON.parse(trSaved);
          history.forEach((h: any) => {
            const d = new Date(h.playedAt || Date.now());
            const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
            activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
            hasRealSessions = true;
          });
        }
      } catch {}
    }

    // 2. Generate seed-based visually complete mock activity if no history exists yet
    if (!hasRealSessions) {
      const now = new Date();
      for (let i = 0; i < 365; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        
        // Deterministic seeding based on date to maintain layout stability
        const day = date.getDay();
        const seed = date.getDate() + (date.getMonth() + 1) * 31;
        
        let sessions = 0;
        if (seed % 7 === 0) {
          sessions = 0; // rest days
        } else if (seed % 19 === 0) {
          sessions = 4; // intensity peak
        } else if (seed % 11 === 0) {
          sessions = 3;
        } else if (seed % 5 === 0) {
          sessions = 1;
        } else if (seed % 8 === 0 && day !== 0 && day !== 6) {
          sessions = 2;
        }
        activityMap[dateStr] = sessions;
      }
    }

    // 3. Construct 53-week Sunday-to-Saturday layout
    // Compute start date: 364 days ago, aligned to the preceding Sunday
    const today = new Date();
    const days: HeatmapDay[] = [];
    
    // Find the Sunday of the week containing 364 days ago
    const startDate = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000);
    const startDayOfWeek = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - startDayOfWeek); // Roll back to Sunday

    // Loop exactly 53 weeks (371 days) to make a perfect grid
    const totalDays = 53 * 7;
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = currentDate.toISOString().split("T")[0];
      const sessions = activityMap[dateStr] || 0;
      
      const formattedDate = currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      days.push({
        date: currentDate,
        dateStr,
        sessions,
        label: `${sessions} session${sessions !== 1 ? "s" : ""} on ${formattedDate}`,
      });
    }

    return { days, hasRealSessions };
  }, []);

  const { days, hasRealSessions } = activityData;

  // Group days into 53 columns (each containing 7 rows)
  const columns = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    for (let i = 0; i < 53; i++) {
      cols.push(days.slice(i * 7, (i + 1) * 7));
    }
    return cols;
  }, [days]);

  // Determine cell color opacity depending on session count
  const getCellStyles = (sessions: number) => {
    if (sessions === 0) {
      return {
        background: "var(--bg-raised)",
        border: "1px solid var(--bg-border)",
        opacity: 1,
      };
    }
    
    // Theme-compatible accent opacity levels
    const opacities = [0.25, 0.5, 0.75, 1];
    const opacityIdx = Math.min(sessions - 1, opacities.length - 1);
    
    return {
      background: "var(--accent)",
      border: "1px solid transparent",
      opacity: opacities[opacityIdx],
    };
  };

  const handleCellMouseEnter = (e: React.MouseEvent, day: HeatmapDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (container) {
      setTooltipPos({
        x: rect.left - container.left + rect.width / 2,
        y: rect.top - container.top - 36,
      });
    }
    setHoveredDay(day);
  };

  const handleCellMouseLeave = () => {
    setHoveredDay(null);
  };

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--bg-border)",
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 32,
        position: "relative",
        animation: "fadeInUp 0.35s ease forwards 0.2s",
        opacity: 0,
      }}
    >
      {/* Heatmap Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined" style={{ color: "var(--accent)", fontSize: 20 }}>
            calendar_view_month
          </span>
          <h4
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Practice Frequency Heatmap
          </h4>
          {!hasRealSessions && (
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "#e2b714",
                background: "rgba(226, 183, 20, 0.1)",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid rgba(226, 183, 20, 0.2)",
              }}
            >
              PREVIEW
            </span>
          )}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "var(--text-muted)",
          }}
        >
          Daily Training volume (Last 1 Year)
        </div>
      </div>

      {/* Contribution Grid Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none", // Firefox
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 3.5,
            width: "max-content",
            padding: "8px 0",
          }}
        >
          {/* Weekday labels */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: 98,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8.5,
              color: "var(--text-muted)",
              paddingRight: 6,
              textAlign: "right",
            }}
          >
            <span>Sun</span>
            <span>Tue</span>
            <span>Thu</span>
            <span>Sat</span>
          </div>

          {/* 53 Columns */}
          {columns.map((week, weekIdx) => (
            <div
              key={weekIdx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3.5,
              }}
            >
              {week.map((day, dayIdx) => {
                const cellStyle = getCellStyles(day.sessions);
                return (
                  <div
                    key={dayIdx}
                    onMouseEnter={(e) => handleCellMouseEnter(e, day)}
                    onMouseLeave={handleCellMouseLeave}
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 2.5,
                      cursor: "pointer",
                      transition: "transform 0.1s ease",
                      transform: hoveredDay?.dateStr === day.dateStr ? "scale(1.2)" : "scale(1)",
                      ...cellStyle,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: "var(--text-muted)",
          }}
        >
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => {
            const legendStyle = getCellStyles(level);
            return (
              <div
                key={level}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 1.5,
                  ...legendStyle,
                }}
              />
            );
          })}
          <span>More</span>
        </div>

        {/* Dynamic Tooltip */}
        {hoveredDay && (
          <div
            style={{
              position: "absolute",
              top: tooltipPos.y,
              left: tooltipPos.x,
              transform: "translateX(-50%)",
              background: "rgba(22, 27, 34, 0.95)",
              backdropFilter: "blur(4px)",
              border: "1px solid var(--accent)",
              borderRadius: 6,
              padding: "6px 10px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              zIndex: 15,
              whiteSpace: "nowrap",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 500,
              color: "var(--text)",
              animation: "scaleIn 0.1s ease forwards",
            }}
          >
            {hoveredDay.label}
          </div>
        )}
      </div>
    </div>
  );
}
