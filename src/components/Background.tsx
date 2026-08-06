"use client"

import { useEffect, useMemo, useState } from "react"

interface Star {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

export function Background() {
  const [mounted, setMounted] = useState(false)

  const stars = useMemo<Star[]>(() => {
    if (typeof window === "undefined") return []
    const count = window.matchMedia("(max-width: 768px)").matches ? 40 : 90
    return Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      delay: Math.random() * 6,
      duration: Math.random() * 4 + 3,
      opacity: 0.3 + Math.random() * 0.6,
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Ambient gradient */}
      <div className="ambient-gradient" />

      {/* Soft moon glow, top right, never distracting */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[46rem] h-[46rem] rounded-full animate-moon-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.09) 0%, rgba(167,139,250,0.03) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Deep indigo presence, bottom left */}
      <div
        className="absolute bottom-[-15%] left-[-8%] w-[40rem] h-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
      />

      {/* Stars */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((s, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Noise */}
      <div className="noise-layer" />
    </div>
  )
}
