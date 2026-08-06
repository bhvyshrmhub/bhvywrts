"use client"

import { useEffect, useRef } from "react"

interface Sparkle {
  x: number
  y: number
  life: number
  maxLife: number
  size: number
  vx: number
  vy: number
}

export function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparklesRef = useRef<Sparkle[]>([])
  const mouseRef = useRef({ x: -2000, y: -2000 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (window.matchMedia("(max-width: 768px)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      // Tiny, sparse sparkles only
      if (Math.random() < 0.35) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.15 + Math.random() * 0.25
        sparklesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          life: 0,
          maxLife: 14 + Math.random() * 10,
          size: 0.8 + Math.random() * 1.2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.15,
        })
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Soft spotlight following cursor
      const { x, y } = mouseRef.current
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 240)
      grad.addColorStop(0, "rgba(177, 108, 234, 0.045)")
      grad.addColorStop(0.5, "rgba(167, 139, 250, 0.02)")
      grad.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Sparkles
      const sparks = sparklesRef.current
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        const t = 1 - p.life / p.maxLife
        if (p.life > p.maxLife || t <= 0) {
          sparks.splice(i, 1)
          continue
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 200, 255, ${t * 0.5})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[90] hidden md:block"
      aria-hidden="true"
    />
  )
}
