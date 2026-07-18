"use client"

import { useThemeValue } from "./ThemeProvider"

export function ThemeToggle() {
  const { themeLabel, themeIcon, cycleTheme } = useThemeValue()

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label={`Theme: ${themeLabel}`}
      title={`Theme: ${themeLabel}`}
    >
      <span className="text-sm">{themeIcon}</span>
      <span className="hidden sm:inline font-medium">{themeLabel}</span>
    </button>
  )
}