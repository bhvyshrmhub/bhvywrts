"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Phase = "stars" | "moon" | "writing" | "hold" | "shrinking" | "done"

export function LandingAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("stars")

  useEffect(() => {
    const timings: Array<[Phase, number]> = [
      ["stars", 0],
      ["moon", 700],
      ["writing", 1600],
      ["hold", 4200],
      ["shrinking", 5200],
      ["done", 6400],
    ]
    const timers = timings.map(([p, delay]) =>
      setTimeout(() => {
        setPhase(p)
        if (p === "done") onComplete()
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      aria-hidden="true"
    >
      {/* Ambient gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(177,108,234,0.06), transparent 60%)" }}
        />
        <div
          className="absolute bottom-[-15%] left-[-10%] w-[45vw] h-[45vw] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.05), transparent 60%)" }}
        />
      </div>

      {/* Stars appear slowly */}
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 1.8 + 0.6}px`,
                  height: `${Math.random() * 1.8 + 0.6}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.3 + Math.random() * 0.5, 0.15, 0.5, 0.25],
                  scale: [0.4, 1, 0.7, 1.2, 0.8],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  delay: 0.2 + Math.random() * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moon softly glows */}
      <AnimatePresence>
        {phase === "moon" || phase === "writing" || phase === "hold" || phase === "shrinking" ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: phase === "shrinking" ? -30 : 0,
              scale: phase === "shrinking" ? 0.55 : 1,
            }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{ top: phase === "shrinking" ? "28%" : "36%", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="relative">
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full animate-moon-glow"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #f5f0ff 0%, #ddd2f5 45%, #b9a8e8 100%)",
                  boxShadow:
                    "0 0 40px rgba(167,139,250,0.25), 0 0 90px rgba(167,139,250,0.12), 0 0 160px rgba(167,139,250,0.06)",
                }}
              />
              {/* Moon craters */}
              <div className="absolute top-[28%] left-[25%] w-3 h-3 rounded-full bg-black/10" />
              <div className="absolute bottom-[24%] right-[22%] w-2 h-2 rounded-full bg-black/8" />
              <div className="absolute top-[55%] left-[50%] w-1.5 h-1.5 rounded-full bg-black/8" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Logo writes itself */}
      <AnimatePresence>
        {phase === "writing" || phase === "hold" || phase === "shrinking" ? (
          <motion.div
            key="logo"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: phase === "shrinking" ? 0.3 : 1,
            }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-center"
            style={{ top: phase === "shrinking" ? "50%" : "54%", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="overflow-hidden pb-2">
              <h1
                className="text-5xl md:text-7xl animate-write-in"
                style={{
                  fontFamily: "var(--font-great-vibes)",
                  background:
                    "linear-gradient(120deg, #e9d5ff 0%, #a78bfa 30%, #c4b5fd 55%, #67e8f9 80%, #e9d5ff 100%)",
                  backgroundSize: "250% 250%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "write-in 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards, logo-shift 7s ease-in-out 1.5s infinite",
                  filter: "drop-shadow(0 0 24px rgba(167,139,250,0.35))",
                }}
              >
                Bhavya Writes
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.9 }}
              className="mt-4 text-xs md:text-sm text-white/35 tracking-[0.35em] uppercase font-[var(--font-grotesk)]"
            >
              A Digital Journal
            </motion.p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Fade to page */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            key="fade"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-black"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
