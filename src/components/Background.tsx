"use client"

import { useMemo, useState, useEffect } from "react"

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
    const count = 6
    return Array.from({ length: count }, (_, i) => ({
      x: ((i * 0.618033988749895) % 1) * 100,
      y: ((i * 0.3819660112501051) % 1) * 100,
      size: 1 + (i % 2) * 0.4,
      delay: i * 1.2,
      duration: 5 + (i % 3),
      opacity: 0.2 + (i % 3) * 0.1,
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* Cinematic background layer */}
      <div className="cinematic-bg" />

      {/* Ambient gradient */}
      <div className="ambient-gradient" />

      {/* Soft pink glow, top right */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[46rem] h-[46rem] rounded-full animate-moon-glow"
        style={{
          background:
            "radial-gradient(circle, rgba(255,182,217,0.06) 0%, rgba(248,168,200,0.02) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Soft blue presence, bottom left */}
      <div
        className="absolute bottom-[-15%] left-[-8%] w-[40rem] h-[40rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(141,211,255,0.04) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
      />

      {/* Sparse stars */}
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
