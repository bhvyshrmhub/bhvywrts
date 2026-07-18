"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function LandingAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"stars" | "moon" | "writing" | "butterfly" | "shrinking" | "done">("stars")
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("moon"), 600)
    const t2 = setTimeout(() => setPhase("writing"), 1500)
    const t3 = setTimeout(() => setPhase("butterfly"), 2100)
    const t4 = setTimeout(() => setPhase("shrinking"), 3400)
    const t5 = setTimeout(() => {
      setPhase("done")
      onComplete()
    }, 4000)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden moonlight"
      style={{ background: "linear-gradient(135deg, #0b0d1a 0%, #11132a 40%, #1a1040 70%, #0b0d1a 100%)" }}
    >
      {/* Stars background */}
      {phase !== "done" && (
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: `${Math.random() * 2.5 + 1}px`,
                height: `${Math.random() * 2.5 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.4 + Math.random() * 0.6, 0.2, 0.5 + Math.random() * 0.5, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Moon */}
      <AnimatePresence>
        {(phase === "moon" || phase === "writing" || phase === "butterfly" || phase === "shrinking") && (
          <motion.div
            key="moon"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{
              opacity: 1,
              scale: phase === "shrinking" ? 0.6 : 1,
              y: phase === "shrinking" ? -40 : 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{
              top: phase === "shrinking" ? "25%" : "35%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 via-purple-100 to-white/80 moon-glow animate-moon-glow" />
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logo with writing animation */}
      <AnimatePresence>
        {(phase === "writing" || phase === "butterfly" || phase === "shrinking") && (
          <motion.div
            key="logo"
            ref={logoRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: phase === "shrinking" ? 0.4 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute text-center"
            style={{
              top: phase === "shrinking" ? "48%" : "52%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div className="overflow-hidden">
              <h1
                className="text-5xl md:text-6xl font-[var(--font-brand)] animate-write-in"
                style={{
                  background: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #8b5cf6 70%, #c4b5fd 100%)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Bhavy Writes
              </h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-sm text-white/40 mt-3 tracking-[0.2em] uppercase text-xs"
            >
              Stories & thoughts
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Butterfly */}
      <AnimatePresence>
        {phase === "butterfly" && (
          <motion.div
            key="butterfly"
            initial={{ opacity: 0, x: -100, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0.6, 0],
              x: [0, 80, 160, 250],
              y: [0, -40, -20, -60],
              rotate: [0, 8, -5, 3],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="absolute text-accent/60 pointer-events-none"
            style={{ top: "45%", left: "35%" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 20c-4 0-6-3-6-6s2-6 6-6 6 3 6 6-2 6-6 6z" />
              <path d="M8 10c-1-2-3-4-3-6 0-2 2-2 4-1s3 3 3 5" />
              <path d="M16 10c1-2 3-4 3-6 0-2-2-2-4-1s-3 3-3 5" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}