"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ButterflyProps {
  className?: string
  delay?: number
  duration?: number
  size?: number
  style?: React.CSSProperties
}

export function Butterfly({ className = "", delay = 0, duration = 6, size = 14, style }: ButterflyProps) {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={style}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.8, 0.6, 0.8, 0],
        x: [0, 40, 80, 60, 100],
        y: [0, -30, -10, -40, -20],
        rotate: [0, 5, -3, 4, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 8,
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent/50"
      >
        <path d="M12 20c-4 0-6-3-6-6s2-6 6-6 6 3 6 6-2 6-6 6z" />
        <path d="M8 10c-1-2-3-4-3-6 0-2 2-2 4-1s3 3 3 5" />
        <path d="M16 10c1-2 3-4 3-6 0-2-2-2-4-1s-3 3-3 5" />
        <path d="M12 14c-1 0-2-1-2-2" />
      </svg>
    </motion.div>
  )
}

export function Butterflies({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Butterfly
          key={i}
          delay={i * 5}
          duration={7 + i * 2}
          size={12 + i * 3}
          className="absolute"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
          }}
        />
      ))}
    </>
  )
}