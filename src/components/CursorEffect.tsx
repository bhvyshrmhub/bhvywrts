"use client"

import { useEffect, useRef } from "react"

export function CursorEffect() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const updateRing = () => {
      if (!ringRef.current) return
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.12
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.12
      ringRef.current.style.transform = `translate(${ringPosRef.current.x - 16}px, ${ringPosRef.current.y - 16}px)`
      requestAnimationFrame(updateRing)
    }

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`
      }
    }

    const onLeave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "0"
      if (ringRef.current) ringRef.current.style.opacity = "0"
    }

    const onEnter = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = "1"
      if (ringRef.current) ringRef.current.style.opacity = "1"
    }

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseenter", onEnter)
    requestAnimationFrame(updateRing)

    return () => {
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseenter", onEnter)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-primary pointer-events-none z-[9999] hidden md:block"
        style={{
          willChange: "transform",
          transition: "opacity 0.3s",
          boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)",
        }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/30 pointer-events-none z-[9999] hidden md:block"
        style={{
          willChange: "transform",
          transition: "opacity 0.3s, width 0.3s, height 0.3s, border-color 0.3s",
        }}
      />
    </>
  )
}