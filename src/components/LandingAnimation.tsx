"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const phrases = [
  "Welcome to Bhavy Writes",
  "Stories, thoughts, and worlds.",
  "Written by Bhavy.",
]

// Generate static star positions for the intro
const stars = Array.from({ length: 120 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 3,
  duration: 2 + Math.random() * 3,
}))

export function LandingAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"moonrise" | "typing" | "brand" | "outro">("moonrise")
  const [step, setStep] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [moonClicks, setMoonClicks] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const [moonPos, setMoonPos] = useState({ x: 0, y: 0 })
  const [soundOn, setSoundOn] = useState(false)
  const moonRef = useRef<HTMLDivElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  // Moonrise phase
  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 2800)
    return () => clearTimeout(t)
  }, [])

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return
    if (step >= phrases.length) {
      const t = setTimeout(() => setPhase("brand"), 800)
      return () => clearTimeout(t)
    }
    const current = phrases[step]
    let i = 0
    setDisplayedText("")
    const interval = setInterval(() => {
      i++
      setDisplayedText(current.slice(0, i))
      if (i >= current.length) {
        clearInterval(interval)
        setTimeout(() => setStep((s) => s + 1), 1400)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [phase, step])

  // Brand -> Outro
  useEffect(() => {
    if (phase !== "brand") return
    const t = setTimeout(() => {
      setPhase("outro")
      setTimeout(onComplete, 1200)
    }, 3000)
    return () => clearTimeout(t)
  }, [phase, onComplete])

  // Moon mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!moonRef.current) return
    const rect = moonRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / 30
    const dy = (e.clientY - cy) / 30
    setMoonPos({ x: dx, y: dy })
  }, [])

  // Easter egg
  const handleMoonClick = () => {
    const next = moonClicks + 1
    setMoonClicks(next)
    if (next >= 5) {
      setShowEasterEgg(true)
      setTimeout(() => setShowEasterEgg(false), 3000)
      setMoonClicks(0)
    }
  }

  // Sound toggle
  const toggleSound = () => {
    if (soundOn) {
      oscRef.current?.stop()
      gainRef.current?.disconnect()
      audioCtxRef.current?.close()
      setSoundOn(false)
      return
    }
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(55, ctx.currentTime)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      oscRef.current = osc
      gainRef.current = gain
      audioCtxRef.current = ctx
      setSoundOn(true)
    } catch {}
  }

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "outro" ? 0 : 1 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000" }}
      onMouseMove={handleMouseMove}
    >
      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <motion.div
        ref={moonRef}
        onClick={handleMoonClick}
        initial={{ opacity: 0, scale: 0.6, y: 80 }}
        animate={{
          opacity: phase === "moonrise" ? 1 : 0.6,
          scale: phase === "moonrise" ? 1 : 0.85,
          y: phase === "moonrise" ? 0 : -60,
          x: moonPos.x,
        }}
        transition={{
          duration: 3,
          ease: [0.16, 1, 0.3, 1],
          x: { type: "spring", stiffness: 100, damping: 20 },
        }}
        className="relative cursor-pointer"
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, #f5f0e8 0%, #e8ddd0 40%, #c4b5a0 70%, #8a7a66 100%)",
          boxShadow: "0 0 60px rgba(245, 240, 232, 0.15), 0 0 120px rgba(245, 240, 232, 0.08), 0 0 200px rgba(245, 240, 232, 0.04)",
          filter: "blur(0.3px)",
        }}
      >
        {/* Moon craters */}
        <div className="absolute top-[25%] left-[30%] w-6 h-6 rounded-full bg-black/10 blur-[1px]" />
        <div className="absolute top-[55%] left-[55%] w-4 h-4 rounded-full bg-black/8 blur-[1px]" />
        <div className="absolute top-[40%] left-[20%] w-3 h-3 rounded-full bg-black/6 blur-[1px]" />
        <div className="absolute top-[65%] left-[25%] w-5 h-5 rounded-full bg-black/8 blur-[1px]" />

        {/* Breathing glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 60px rgba(245, 240, 232, 0.15), 0 0 120px rgba(245, 240, 232, 0.08)",
              "0 0 80px rgba(245, 240, 232, 0.25), 0 0 160px rgba(245, 240, 232, 0.12)",
              "0 0 60px rgba(245, 240, 232, 0.15), 0 0 120px rgba(245, 240, 232, 0.08)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Typing text */}
      <AnimatePresence mode="wait">
        {phase === "typing" && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            className="absolute bottom-1/3 text-center"
          >
            <span className="text-xl sm:text-2xl md:text-3xl text-white/80 font-light tracking-wide">
              {displayedText}
            </span>
            {showCursor && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-[2px] h-6 sm:h-7 bg-white/60 ml-1 align-middle"
              />
            )}
          </motion.div>
        )}

        {/* Brand reveal */}
        {phase === "brand" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute bottom-1/3 text-center space-y-6"
          >
            <motion.h1
              initial={{ filter: "blur(12px)", y: 30 }}
              animate={{ filter: "blur(0px)", y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white"
            >
              {"BHAVY WRITES".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.035, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="text-white/50 text-base sm:text-lg font-light tracking-wide"
            >
              A place where stories become memories.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter egg */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[15%] text-center"
          >
            <p className="text-white/40 text-sm sm:text-base font-light italic tracking-wide">
              "Every story begins in darkness."
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound toggle */}
      {phase !== "moonrise" && (
        <button
          onClick={toggleSound}
          className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/20 transition-all text-xs"
          title={soundOn ? "Mute ambience" : "Play moon ambience"}
        >
          {soundOn ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              <path d="M19.07 4.93a10 10 0 010 14.14" />
              <path d="M15.54 8.46a5 5 0 010 7.07" />
            </svg>
          )}
        </button>
      )}
    </motion.div>
  )
}
