import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

// index.html reads the same key before the first paint.
const STORAGE_KEY = "theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

/** The active theme and a toggle. Follows the system until the user picks one. */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    function followSystem() {
      if (storedTheme()) return;
      const next: Theme = media.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    }
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode: the choice lasts for the tab.
    }
    setTheme(next);
  }

  return { theme, toggle };
}
