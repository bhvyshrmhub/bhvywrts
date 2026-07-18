"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LandingAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"moon" | "brand" | "done">("moon")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("brand"), 1200)
    const t2 = setTimeout(() => setPhase("done"), 2400)
    const t3 = setTimeout(onComplete, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === "moon" && (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          </motion.div>
        )}
        {phase === "brand" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <h1 className="text-4xl font-[var(--font-brand)] text-foreground">
              Bhavy Writes
            </h1>
            <p className="text-sm text-muted-foreground mt-2 tracking-wide">
              Stories & thoughts
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}