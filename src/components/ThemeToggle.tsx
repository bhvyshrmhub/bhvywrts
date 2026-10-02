"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-16 h-8 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)]",
          className
        )}
      />
    )
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className={cn(
        "relative flex items-center p-0.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] backdrop-blur-md transition-colors",
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
        aria-label="Light mode"
        title="Light mode"
        className={cn(
          "relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs transition-colors cursor-pointer",
          !isDark
            ? "text-amber-500 font-semibold"
            : "text-[var(--text-3)] hover:text-[var(--text)]"
        )}
      >
        {!isDark && (
          <motion.span
            layoutId="theme-pill-indicator"
            className="absolute inset-0 rounded-full bg-white shadow-sm border border-black/10 -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => setTheme("dark")}
        aria-label="Dark mode"
        title="Dark mode"
        className={cn(
          "relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-xs transition-colors cursor-pointer",
          isDark
            ? "text-[var(--orchid)] font-semibold"
            : "text-[var(--text-3)] hover:text-[var(--text)]"
        )}
      >
        {isDark && (
          <motion.span
            layoutId="theme-pill-indicator"
            className="absolute inset-0 rounded-full bg-white/20 dark:bg-white/15 shadow-sm border border-white/25 -z-10"
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
          />
        )}
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
