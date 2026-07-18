"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  alpha: number
  size: number
  life: number
  maxLife: number
  vx: number
  vy: number
}

export function GlitterCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.matchMedia("(max-width: 768px)").matches
    if (isMobile) return

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
      // Spawn particles
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 0.5
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 4,
          y: e.clientY + (Math.random() - 0.5) * 4,
          alpha: 0.4 + Math.random() * 0.4,
          size: 1.5 + Math.random() * 2,
          life: 0,
          maxLife: 20 + Math.random() * 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
        })
      }
    }

    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02
        p.alpha *= 0.96

        if (p.life > p.maxLife || p.alpha < 0.01) {
          particles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 180, 255, ${p.alpha})`
        ctx.fill()
      }

      // Limit particles
      if (particles.length > 200) {
        particles.splice(0, particles.length - 200)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] hidden md:block"
      style={{ mixBlendMode: "screen" }}
    />
  )
}
