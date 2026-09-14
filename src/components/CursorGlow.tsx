"use client"

import { useEffect, useRef, useState } from "react"

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number>(0)
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Only on desktop with fine pointer
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(pointer: fine)")
    if (!mq.matches) return

    // Respect reduced motion
    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (rmq.matches) return

    function onMove(e: MouseEvent) {
      targetRef.current = { x: e.clientX, y: e.clientY }
      if (!visible) setVisible(true)
    }

    function onLeave() {
      setVisible(false)
    }

    function animate() {
      const lerp = 0.12
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp

      if (glowRef.current) {
        glowRef.current.style.left = `${currentRef.current.x}px`
        glowRef.current.style.top = `${currentRef.current.y}px`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    document.addEventListener("mousemove", onMove, { passive: true })
    document.addEventListener("mouseleave", onLeave)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [visible])

  return (
    <div
      ref={glowRef}
      className={`cursor-glow ${visible ? "visible" : ""}`}
      aria-hidden="true"
    />
  )
}
