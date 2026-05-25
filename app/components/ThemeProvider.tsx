"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "dark" | "night" | "latte" | "carbon" | "rose";

export const THEMES: { id: ThemeId; label: string; bg: string; accent: string }[] = [
  { id: "dark",   label: "Dark",       bg: "#0f0f0f", accent: "#e2b714" },
  { id: "night",  label: "Night Owl",  bg: "#011627", accent: "#addb67" },
  { id: "latte",  label: "Latte",      bg: "#eff1f5", accent: "#1e66f5" },
  { id: "carbon", label: "Carbon",     bg: "#161616", accent: "#0f62fe" },
  { id: "rose",   label: "Rosé Pine",  bg: "#191724", accent: "#ebbcba" },
];

const ThemeCtx = createContext<{
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("alpha-theme") as ThemeId | null;
    if (saved && THEMES.find(t => t.id === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("alpha-theme", t);
  };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
