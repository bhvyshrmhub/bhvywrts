"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 40,
    restDelta: 0.001,
  })

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #8B5CF6 0%, #C084FC 40%, #E879F9 70%, #8B5CF6 100%)",
          boxShadow: "0 0 12px rgba(139, 92, 246, 0.3)",
        }}
      />
      <motion.div
        className="fixed top-[3px] left-0 right-0 z-[60] h-[6px] origin-left opacity-30 blur-sm"
        style={{
          scaleX,
          background:
            "linear-gradient(90deg, #8B5CF6 0%, #E879F9 100%)",
        }}
      />
    </>
  )
}