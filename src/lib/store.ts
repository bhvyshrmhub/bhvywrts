"use client"

import { create } from "zustand"
import type { WritingMode } from "@/types"

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

interface AuthStore {
  isAdmin: boolean
  checking: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  checking: true,
  login: async (username, password) => {
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
    await fetch("/api/auth/logout")
    set({ isAdmin: false })
  },
  checkAuth: async () => {
    try {
      const res = await fetch("/api/auth/verify")
      set({ isAdmin: res.ok, checking: false })
    } catch {
      set({ isAdmin: false, checking: false })
    }
  },
}))
