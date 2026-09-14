"use client"

import { useEffect, useState } from "react"

interface StarProps {
  count?: number
  className?: string
}

export function Stars({ count = 8, className = "" }: StarProps) {
  const [stars, setStars] = useState<Array<{ x: number; y: number; size: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      // Deterministic positions using golden ratio
      x: ((i * 0.618033988749895) % 1) * 100,
      y: ((i * 0.3819660112501051) % 1) * 100,
      size: 1 + (i % 3) * 0.5,
      delay: i * 0.7,
      duration: 4 + (i % 3),
    }))
    setStars(generated)
  }, [count])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
