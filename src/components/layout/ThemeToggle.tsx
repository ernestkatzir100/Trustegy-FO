"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center justify-center shrink-0 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        width: 32,
        height: 32,
        background: "var(--border-subtle)",
        color: "var(--text-secondary)",
      }}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon style={{ width: 15, height: 15 }} strokeWidth={2} />
      ) : (
        <Sun style={{ width: 15, height: 15 }} strokeWidth={2} />
      )}
    </button>
  );
}
