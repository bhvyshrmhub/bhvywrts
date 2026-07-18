"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

type Theme = "light" | "dark"

const THEME_KEY = "bhavy-theme"

const themeLabels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
}

const themeIcons: Record<Theme, string> = {
  light: "☀️",
  dark: "🌙",
}

const themeOrder: Theme[] = ["light", "dark"]

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  cycleTheme: () => void
  themeLabel: string
  themeIcon: string
}

const ThemeCtx = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  cycleTheme: () => {},
  themeLabel: "Dark",
  themeIcon: "🌙",
})

export function useThemeValue() {
  return useContext(ThemeCtx)
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null
    if (stored && (stored === "light" || stored === "dark")) {
      setThemeState(stored)
    } else {
      setThemeState(getSystemTheme())
    }
    setMounted(true)
  }, [])

  const applyTheme = useCallback((t: Theme) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem(THEME_KEY, t)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)
  }, [applyTheme])

  const cycleTheme = useCallback(() => {
    const idx = themeOrder.indexOf(theme)
    const next = themeOrder[(idx + 1) % themeOrder.length]
    setTheme(next)
  }, [theme, setTheme])

  useEffect(() => {
    if (mounted) applyTheme(theme)
  }, [mounted, theme, applyTheme])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeCtx.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        themeLabel: themeLabels[theme],
        themeIcon: themeIcons[theme],
      }}
    >
      {children}
    </ThemeCtx.Provider>
  )
}

export type { Theme }
export { themeLabels, themeIcons, themeOrder }
