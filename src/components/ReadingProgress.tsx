"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[55] h-[2px] origin-left"
      style={{
        scaleX: scaleY,
        background: "linear-gradient(90deg, rgba(255,182,217,0.8), rgba(248,168,200,0.6))",
      }}
    />
  )
}
