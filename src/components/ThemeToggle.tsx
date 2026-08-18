"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const THEME_COLORS = { dark: "#000000", light: "#faf9f7" }

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const color = resolvedTheme === "light" ? THEME_COLORS.light : THEME_COLORS.dark
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (meta) meta.content = color
  }, [mounted, resolvedTheme])

  const isDark = resolvedTheme === "dark"

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn(
          "relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-transparent",
          className
        )}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border-strong)] text-[var(--foreground-secondary)] hover:text-foreground hover:border-[var(--border-strong)] transition-colors",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full bg-secondary opacity-0 hover:opacity-100 transition-opacity" />
      <span key={isDark ? "moon" : "sun"} className="relative animate-scale-in">
        {isDark ? <Sun className="w-[17px] h-[17px]" /> : <Moon className="w-[17px] h-[17px]" />}
      </span>
    </button>
  )
}
