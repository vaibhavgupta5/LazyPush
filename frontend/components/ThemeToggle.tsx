"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

export function ThemeToggle() {
  const { isDark, toggleTheme, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <button
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-all duration-300 ml-1 focus:outline-none cursor-pointer"
      style={{
        backgroundColor: isDark ? "var(--green)" : "var(--border)",
        boxShadow: isDark
          ? "0 0 10px rgba(var(--green), 0.4), inset 0 1px 2px rgba(0,0,0,0.2)"
          : "inset 0 1px 3px rgba(0,0,0,0.15)",
      }}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
        style={{ backgroundColor: "var(--surface)" }}
      >
        {isDark ? (
          <Moon className="h-2.5 w-2.5" style={{ color: "var(--green)" }} />
        ) : (
          <Sun className="h-2.5 w-2.5" style={{ color: "var(--muted)" }} />
        )}
      </span>
    </button>
  );
}
