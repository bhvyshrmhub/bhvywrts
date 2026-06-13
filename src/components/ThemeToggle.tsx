"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Droplets, Sparkles, Leaf, Mountain } from "lucide-react"
import { useThemeStore } from "@/lib/store"
import type { Theme } from "@/types"
import { themes } from "@/lib/themes"

const themeIcons: Record<Theme, React.ReactNode> = {
  midnight: <Moon className="w-4 h-4" />,
  ocean: <Droplets className="w-4 h-4" />,
  sunset: <Sun className="w-4 h-4" />,
  forest: <Leaf className="w-4 h-4" />,
  galaxy: <Sparkles className="w-4 h-4" />,
  paper: <Mountain className="w-4 h-4" />,
}

const themeList: Theme[] = ["midnight", "ocean", "sunset", "forest", "galaxy", "paper"]

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("bhavy-theme") as Theme | null
    if (saved && themeList.includes(saved)) {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const config = themes[theme]
    const root = document.documentElement
    root.style.setProperty("--background", config.bg)
    root.style.setProperty("--card", config.cardBg)
    root.style.setProperty("--foreground", config.text)
    root.style.setProperty("--muted-foreground", config.muted)
    root.style.setProperty("--border", config.border)
    root.style.setProperty("--accent", config.accent)
    root.style.setProperty("--ring", config.muted)
    root.className = theme === "paper" ? "" : "dark"
  }, [theme, mounted])

  if (!mounted) return null

  const cycleTheme = () => {
    const currentIndex = themeList.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themeList.length
    setTheme(themeList[nextIndex])
  }

  return (
    <button
      onClick={cycleTheme}
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/30 hover:bg-accent/50 border border-border/50 transition-all text-xs text-muted-foreground"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {themeIcons[theme]}
        </motion.span>
      </AnimatePresence>
      <span className="hidden sm:inline">{themes[theme].name}</span>
    </button>
  )
}
