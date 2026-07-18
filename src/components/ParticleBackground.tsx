"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  alphaSpeed: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 16000))

    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.05,
      alphaSpeed: (Math.random() - 0.5) * 0.003,
    }))

    const color1 = "139, 92, 246"
    const color2 = "232, 121, 249"
    const color3 = "192, 132, 252"

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.alphaSpeed

        if (p.alpha > 0.5 || p.alpha < 0.02) p.alphaSpeed *= -1
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const blend = Math.sin(p.x * 0.001 + p.y * 0.001 + Date.now() * 0.0003) * 0.5 + 0.5
        const r = Math.round(parseInt(color1.split(",")[0]) * (1 - blend) + parseInt(color3.split(",")[0]) * blend)
        const g = Math.round(parseInt(color1.split(",")[1]) * (1 - blend) + parseInt(color3.split(",")[1]) * blend)
        const b = Math.round(parseInt(color1.split(",")[2]) * (1 - blend) + parseInt(color3.split(",")[2]) * blend)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`
        ctx.fill()
      })

      particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 180) {
            const blend = Math.sin(a.x * 0.001 + b.y * 0.001) * 0.5 + 0.5
            const alpha = 0.03 * (1 - dist / 180)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${color1}, ${alpha})`
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.5 }}
      />
      <motion.div
        className="fixed top-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full pointer-events-none z-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.04) 0%, rgba(232,121,249,0.02) 40%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-10%] left-[-10%] w-[35vw] h-[35vw] rounded-full pointer-events-none z-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(192,132,252,0.03) 0%, rgba(139,92,246,0.02) 40%, transparent 70%)",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  )
}