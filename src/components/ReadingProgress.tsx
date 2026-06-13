"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useSpring } from "framer-motion"

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500"
      style={{ scaleY }}
    />
  )
}
