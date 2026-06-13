"use client"

import { useEffect, useRef } from "react"

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`
      }
    }

    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-5 h-5 rounded-full bg-white/10 border border-white/20 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        willChange: "transform",
        transition: "width 0.3s, height 0.3s, background 0.3s",
      }}
    />
  )
}
