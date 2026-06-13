"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { PenSquare } from "lucide-react"
import { useAuthStore } from "@/lib/store"

export function FloatingWriteButton() {
  const { isAdmin, checking } = useAuthStore()

  if (checking || !isAdmin) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        href="/editor"
        className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all"
      >
        <PenSquare className="w-4 h-4" />
        <span className="text-sm font-medium">Write Story</span>
      </Link>
    </motion.div>
  )
}
