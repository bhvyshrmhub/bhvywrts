"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PenSquare } from "lucide-react"
import { useAuthStore } from "@/lib/store"

export function FloatingWriteButton() {
  const { isAdmin, checking } = useAuthStore()
  const [visible, setVisible] = useState(true)
  const lastScroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current > 300) {
        setVisible(current < lastScroll.current)
      } else {
        setVisible(true)
      }
      lastScroll.current = current
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (checking || !isAdmin) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Link
            href="/editor"
            className="group relative flex items-center gap-2.5 px-5 py-3 rounded-2xl glass-strong text-white shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2.5">
              <PenSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Write Story</span>
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}