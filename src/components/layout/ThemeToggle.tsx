"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "light" ? "מצב כהה" : "מצב בהיר"}
      style={{
        width: 34,
        height: 34,
        borderRadius: "var(--radius-sm)",
        background: "transparent",
        border: "1px solid var(--border-strong)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent-subtle)";
        e.currentTarget.style.color = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {theme === "light" ? (
        <Moon size={15} strokeWidth={2} />
      ) : (
        <Sun size={15} strokeWidth={2} />
      )}
    </button>
  );
}
