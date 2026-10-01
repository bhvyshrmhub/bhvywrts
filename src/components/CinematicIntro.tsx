"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"

const DEFAULT_COVER =
  "https://zyuubroahspccwrufzub.supabase.co/storage/v1/object/public/covers/1789790749402-mnvzdwleln8.jpg"

interface CinematicIntroProps {
  coverImage?: string | null
  onComplete?: () => void
}

export function CinematicIntro({ coverImage, onComplete }: CinematicIntroProps) {
  const [shouldRender, setShouldRender] = useState(false)
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0) // 0: initial, 1: image reveal, 2: editorial text, 3: dissolving
  const [isMobile, setIsMobile] = useState(false)
  const timerRefs = useRef<NodeJS.Timeout[]>([])

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach((t) => clearTimeout(t))
    timerRefs.current = []
  }, [])

  const finishIntro = useCallback(() => {
    clearAllTimers()
    try {
      sessionStorage.setItem("bhavy-intro-seen", "true")
      document.documentElement.classList.remove("intro-active")
    } catch {}
    setPhase(3)
    // Short dissolve before unmounting
    setTimeout(() => {
      setShouldRender(false)
      onComplete?.()
    }, 450)
  }, [clearAllTimers, onComplete])

  useEffect(() => {
    // 1. Check if user already saw intro in current session
    try {
      const alreadySeen = sessionStorage.getItem("bhavy-intro-seen")
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (alreadySeen || prefersReduced) {
        document.documentElement.classList.remove("intro-active")
        setShouldRender(false)
        onComplete?.()
        return
      }
    } catch {
      // In case of restricted environment
      setShouldRender(false)
      onComplete?.()
      return
    }

    // 2. Determine screen size
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    setShouldRender(true)

    // 3. Timelines (in ms):
    // Desktop:
    //   0ms: Logo fades in softly, image starts blurry & low opacity
    //   700ms: Image smoothly expands/unblurs (scale 1.06 -> 1.00, blur 10px -> 0px)
    //   1600ms: Editorial line reveals softly
    //   2350ms: Dissolve into homepage begins
    //   2900ms: Complete and unmount
    //
    // Mobile (fast 2.4s):
    //   0ms: Logo fades in
    //   500ms: Image expands/unblurs
    //   1300ms: Editorial line reveals
    //   1900ms: Dissolve begins
    //   2400ms: Complete and unmount

    const tImage = mobile ? 500 : 700
    const tEditorial = mobile ? 1300 : 1600
    const tDissolve = mobile ? 1900 : 2350
    const tEnd = mobile ? 2400 : 2900

    timerRefs.current.push(
      setTimeout(() => setPhase(1), tImage),
      setTimeout(() => setPhase(2), tEditorial),
      setTimeout(() => setPhase(3), tDissolve),
      setTimeout(() => {
        try {
          sessionStorage.setItem("bhavy-intro-seen", "true")
          document.documentElement.classList.remove("intro-active")
        } catch {}
        setShouldRender(false)
        onComplete?.()
      }, tEnd)
    )

    return () => {
      clearAllTimers()
      try {
        document.documentElement.classList.remove("intro-active")
      } catch {}
    }
  }, [clearAllTimers, onComplete])

  if (!shouldRender) return null

  const imageSrc = coverImage || DEFAULT_COVER

  return (
    <AnimatePresence>
      {phase < 3 ? (
        <motion.div
          key="cinematic-intro"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center overflow-hidden select-none"
          style={{ willChange: "opacity" }}
        >
          {/* Subtle Cinematic Photography Layer */}
          <motion.div
            initial={{
              opacity: 0.15,
              scale: 1.06,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: phase >= 1 ? (isMobile ? 0.45 : 0.55) : 0.15,
              scale: phase >= 1 ? 1.0 : 1.06,
              filter: phase >= 1 ? "blur(0px)" : "blur(10px)",
            }}
            transition={{
              duration: isMobile ? 1.2 : 1.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <img
              src={imageSrc}
              alt=""
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Cinematic Vignette & AMOLED Gradient Overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(5,5,5,0.45) 0%, rgba(5,5,5,0.85) 65%, #050505 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/75 pointer-events-none" />

          {/* Delicate Central Orchid Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[360px] rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #e879f9 0%, #a855f7 60%, transparent 80%)",
            }}
          />

          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            type="button"
            onClick={finishIntro}
            className="absolute top-5 right-5 sm:top-8 sm:right-8 z-30 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-[var(--font-grotesk)] text-white/55 hover:text-white border border-white/10 hover:border-white/25 bg-black/40 backdrop-blur-md transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Skip opening animation"
          >
            <span>Skip</span>
            <ArrowRight className="w-3 h-3 text-[var(--orchid)]" />
          </motion.button>

          {/* Centered Editorial Content */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-xl mx-auto">
            {/* Logo Reveal (0.0s - 0.7s) */}
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{
                opacity: 1,
                y: phase >= 2 ? (isMobile ? -6 : -10) : 0,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h1
                className="font-[var(--font-instrument-serif)] text-4xl sm:text-5.5xl md:text-6xl text-foreground tracking-tight select-none leading-none"
                style={{
                  textShadow:
                    "0 0 40px rgba(255,255,255,0.22), 0 0 80px rgba(232,121,249,0.18)",
                }}
              >
                Bhavya Writes
              </h1>
            </motion.div>

            {/* Editorial Line Reveal (1.6s - 2.3s) */}
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                y: phase >= 2 ? 0 : 14,
                filter: phase >= 2 ? "blur(0px)" : "blur(3px)",
              }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-4 sm:mt-5"
            >
              <p className="font-[var(--font-source-serif)] italic text-base sm:text-lg md:text-xl text-[#d4d4d8] tracking-wide leading-relaxed">
                A quieter corner of the internet.
              </p>

              {/* Glowing Moon Emblem Divider */}
              <div
                className="mt-4 flex items-center justify-center gap-2.5 opacity-80"
                aria-hidden="true"
              >
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--border-strong)]" />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "radial-gradient(circle, #fff5f9 0%, #e879f9 100%)",
                    boxShadow: "0 0 10px rgba(232,121,249,0.6)",
                  }}
                />
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--border-strong)]" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
