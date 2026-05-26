"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export interface UserProfile {
  username: string;
  avatarUrl: string;
  provider: "github" | "google" | "guest" | "none";
  level: number;
  xp: number;
  createdAt: number;
  bio?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Guest Player",
  avatarUrl: "",
  provider: "none",
  level: 1,
  xp: 0,
  createdAt: Date.now(),
  bio: "Aspiring musical virtuoso training for elite perfect pitch.",
  linkedin: "",
  instagram: "",
  github: "",
};

// Key names for localStorage
const PROFILE_KEY = "alpha-user-profile";

// Custom Event to notify other components of updates
export const PROFILE_UPDATE_EVENT = "alpha-profile-update";

// Get training and library history key based on logged in user
export function getTrainingHistoryKey(): string {
  if (typeof window === "undefined") return "alpha-training-history";
  const email = localStorage.getItem("alpha-last-active-email");
  return email ? `alpha-training-history-${email}` : "alpha-training-history";
}

export function getLibraryHistoryKey(): string {
  if (typeof window === "undefined") return "alpha-library-history";
  const email = localStorage.getItem("alpha-last-active-email");
  return email ? `alpha-library-history-${email}` : "alpha-library-history";
}

// Get current local profile (Guest)
export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_PROFILE;
}

// Save local profile and trigger event
export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
  } catch {}
}

// Log in with simulated provider details (remained for simulated login backup/guest toggle)
export function loginSimulated(provider: "github" | "google", username: string, avatarUrl: string) {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    username,
    avatarUrl,
    provider,
    createdAt: current.provider === "none" ? Date.now() : current.createdAt,
  };
  saveUserProfile(updated);
}

// Log in as Guest
export function loginAsGuest() {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    username: "Guest Musician",
    avatarUrl: "",
    provider: "guest",
    createdAt: current.provider === "none" ? Date.now() : current.createdAt,
  };
  saveUserProfile(updated);
}

// Log out local user
export function logoutUser() {
  saveUserProfile(DEFAULT_PROFILE);
}

// Update profile name or avatar
export function updateProfile(fields: Partial<UserProfile>) {
  if (typeof window === "undefined") return;
  const lastActiveEmail = localStorage.getItem("alpha-last-active-email");

  if (lastActiveEmail) {
    // If authenticated, we allow updating username and customization in custom localStorage stats
    const statsKey = `alpha-profile-stats-${lastActiveEmail}`;
    try {
      const saved = localStorage.getItem(statsKey);
      const stats = saved ? JSON.parse(saved) : { level: 1, xp: 0, createdAt: Date.now() };
      
      const updatedStats = {
        ...stats,
        customUsername: fields.username !== undefined ? fields.username : stats.customUsername,
        customAvatarUrl: fields.avatarUrl !== undefined ? fields.avatarUrl : stats.customAvatarUrl,
        bio: fields.bio !== undefined ? fields.bio : stats.bio,
        linkedin: fields.linkedin !== undefined ? fields.linkedin : stats.linkedin,
        instagram: fields.instagram !== undefined ? fields.instagram : stats.instagram,
        github: fields.github !== undefined ? fields.github : stats.github,
      };
      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
      window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
    } catch {}
  } else {
    const current = getUserProfile();
    saveUserProfile({
      ...current,
      ...fields,
    });
  }
}

// Add XP and level up if threshold is crossed (1000 XP per level)
export function addXP(amount: number) {
  if (typeof window === "undefined") return;
  const lastActiveEmail = localStorage.getItem("alpha-last-active-email");

  if (lastActiveEmail) {
    const statsKey = `alpha-profile-stats-${lastActiveEmail}`;
    let stats = { level: 1, xp: 0, createdAt: Date.now() };
    try {
      const saved = localStorage.getItem(statsKey);
      if (saved) stats = JSON.parse(saved);
    } catch {}

    let newXP = stats.xp + amount;
    let newLevel = stats.level;
    
    while (newXP >= newLevel * 1000) {
      newXP -= newLevel * 1000;
      newLevel += 1;
    }

    const updatedStats = {
      ...stats,
      xp: newXP,
      level: newLevel,
    };

    try {
      localStorage.setItem(statsKey, JSON.stringify(updatedStats));
      window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
    } catch {}
  } else {
    const current = getUserProfile();
    let newXP = current.xp + amount;
    let newLevel = current.level;
    
    while (newXP >= newLevel * 1000) {
      newXP -= newLevel * 1000;
      newLevel += 1;
    }
    
    saveUserProfile({
      ...current,
      xp: newXP,
      level: newLevel,
    });
  }
}

// Aggregate overall statistics
export interface AggregatedStats {
  totalNotesPlayed: number;
  avgAccuracy: number;
  maxCombo: number;
  totalScore: number;
  totalSessions: number;
  unlockedPacksCount: number;
  timePracticedMin: number;
}

export function getAggregatedStats(): AggregatedStats {
  if (typeof window === "undefined") {
    return { totalNotesPlayed: 0, avgAccuracy: 0, maxCombo: 0, totalScore: 0, totalSessions: 0, unlockedPacksCount: 2, timePracticedMin: 0 };
  }

  let totalNotesPlayed = 0;
  let scoreSum = 0;
  let accuracySum = 0;
  let maxCombo = 0;
  let totalSessions = 0;

  const trainingHistoryKey = getTrainingHistoryKey();
  const libraryHistoryKey = getLibraryHistoryKey();

  // 1. Library History
  try {
    const libSaved = localStorage.getItem(libraryHistoryKey);
    if (libSaved) {
      const history = JSON.parse(libSaved);
      history.forEach((h: any) => {
        totalSessions += 1;
        totalNotesPlayed += h.accuracy > 0 ? Math.round(h.score / 100) : 10;
        scoreSum += h.score || 0;
        accuracySum += h.accuracy || 0;
      });
    }
  } catch {}

  // 2. Training History
  try {
    const trSaved = localStorage.getItem(trainingHistoryKey);
    if (trSaved) {
      const history = JSON.parse(trSaved);
      history.forEach((h: any) => {
        totalSessions += 1;
        totalNotesPlayed += h.totalAttempts || 0;
        scoreSum += h.score || 0;
        accuracySum += h.accuracy || 0;
        if (h.maxCombo > maxCombo) maxCombo = h.maxCombo;
      });
    }
  } catch {}

  // 3. Max Combo from Library recent history
  try {
    const libHistory = localStorage.getItem(libraryHistoryKey);
    if (libHistory) {
      const history = JSON.parse(libHistory);
      history.forEach((h: any) => {
        if (h.maxCombo && h.maxCombo > maxCombo) {
          maxCombo = h.maxCombo;
        }
      });
    }
  } catch {}

  // 4. Unlocked packs
  let unlockedPacksCount = 2;
  try {
    const savedUnlocks = localStorage.getItem("alpha-library-unlocks");
    if (savedUnlocks) {
      const list = JSON.parse(savedUnlocks);
      unlockedPacksCount = Math.max(2, list.length);
    }
  } catch {}

  // Estimate total minutes practiced (e.g. 1.5 minutes per session completed)
  const timePracticedMin = Math.round(totalSessions * 1.5);
  const avgAccuracy = totalSessions > 0 ? Math.round(accuracySum / totalSessions) : 0;

  return {
    totalNotesPlayed,
    avgAccuracy,
    maxCombo,
    totalScore: scoreSum,
    totalSessions,
    unlockedPacksCount,
    timePracticedMin,
  };
}

// React Hook for subscription to NextAuth + localStorage state changes
export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const loadProfile = () => {
      if (status === "authenticated" && session?.user) {
        const email = session.user.email || "unknown";
        localStorage.setItem("alpha-last-active-email", email);

        const statsKey = `alpha-profile-stats-${email}`;
        let stats = { 
          level: 1, 
          xp: 0, 
          createdAt: Date.now(), 
          customUsername: "", 
          customAvatarUrl: "",
          bio: "Aspiring musical virtuoso training for elite perfect pitch.",
          linkedin: "",
          instagram: "",
          github: ""
        };
        try {
          const saved = localStorage.getItem(statsKey);
          if (saved) {
            stats = { ...stats, ...JSON.parse(saved) };
          } else {
            localStorage.setItem(statsKey, JSON.stringify(stats));
          }
        } catch {}

        setProfile({
          username: stats.customUsername || session.user.name || "Real Musician",
          avatarUrl: stats.customAvatarUrl || session.user.image || "",
          provider: (session as any).provider || "google",
          level: stats.level,
          xp: stats.xp,
          createdAt: stats.createdAt,
          bio: stats.bio,
          linkedin: stats.linkedin || "",
          instagram: stats.instagram || "",
          github: stats.github || "",
        });
      } else if (status === "unauthenticated") {
        localStorage.removeItem("alpha-last-active-email");
        setProfile(getUserProfile());
      } else {
        setProfile(getUserProfile());
      }
    };

    loadProfile();

    const handleUpdate = () => {
      loadProfile();
    };
    
    window.addEventListener(PROFILE_UPDATE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(PROFILE_UPDATE_EVENT, handleUpdate);
    };
  }, [session, status]);

  return profile;
}
