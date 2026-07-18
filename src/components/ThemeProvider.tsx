"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

type Theme = "moonlight" | "aurora" | "blossom"

const THEME_KEY = "bhavy-theme"

const themeLabels: Record<Theme, string> = {
  moonlight: "Moonlight",
  aurora: "Aurora",
  blossom: "Blossom",
}

const themeIcons: Record<Theme, string> = {
  moonlight: "🌙",
  aurora: "☀️",
  blossom: "🌸",
}

const themeOrder: Theme[] = ["moonlight", "aurora", "blossom"]

interface ThemeContextType {
  theme: Theme
  setTheme: (t: Theme) => void
  cycleTheme: () => void
  themeLabel: string
  themeIcon: string
}

const ThemeCtx = createContext<ThemeContextType>({
  theme: "moonlight",
  setTheme: () => {},
  cycleTheme: () => {},
  themeLabel: "Moonlight",
  themeIcon: "🌙",
})

export function useThemeValue() {
  return useContext(ThemeCtx)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("moonlight")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null) as Theme | null
    if (stored && themeOrder.includes(stored)) {
      setThemeState(stored)
    }
    setMounted(true)
  }, [])

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.className = t
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