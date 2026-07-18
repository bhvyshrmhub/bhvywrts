"use client"

import Link from "next/link"
import { PenSquare } from "lucide-react"
import { useAuthStore } from "@/lib/store"

export function FloatingWriteButton() {
  const { isAdmin, checking } = useAuthStore()

  if (!isAdmin || checking) return null

  return (
    <Link
      href="/editor"
      className="fixed bottom-20 right-5 md:bottom-6 md:right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-all hover:scale-105 active:scale-95"
      aria-label="Write a new story"
    >
      <PenSquare className="w-5 h-5" />
    </Link>
  )
}