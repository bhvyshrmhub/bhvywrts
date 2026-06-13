"use client"

import { create } from "zustand"
import type { Theme, WritingMode } from "@/types"

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "midnight",
  setTheme: (theme) => {
    set({ theme })
    if (typeof window !== "undefined") {
      localStorage.setItem("bhavy-theme", theme)
    }
  },
}))

interface EditorStore {
  mode: WritingMode
  setMode: (mode: WritingMode) => void
  metrics: { words: number; characters: number; paragraphs: number; readingTime: number }
  setMetrics: (metrics: { words: number; characters: number; paragraphs: number; readingTime: number }) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  mode: "normal",
  setMode: (mode) => set({ mode }),
  metrics: { words: 0, characters: 0, paragraphs: 0, readingTime: 0 },
  setMetrics: (metrics) => set({ metrics }),
}))

interface UIStore {
  showIntro: boolean
  setShowIntro: (show: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  showIntro: true,
  setShowIntro: (show) => set({ showIntro: show }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

interface AuthStore {
  isAdmin: boolean
  checking: boolean
  checkAuth: () => Promise<void>
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  checking: true,
  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/verify")
      set({ isAdmin: res.ok, checking: false })
    } catch {
      set({ isAdmin: false, checking: false })
    }
  },
  login: async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        set({ isAdmin: true })
        return true
      }
      return false
    } catch {
      return false
    }
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ isAdmin: false })
  },
}))
