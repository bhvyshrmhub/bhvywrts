"use client"

import { useMemo } from "react"

const SYNODIC_MONTH = 29.53058867
const NEW_MOON_EPOCH = Date.UTC(2000, 0, 6, 18, 14) // known new moon

interface PhaseInfo {
  name: string
  icon: string
}

function getPhase(age: number): PhaseInfo {
  if (age < 1.84566) return { name: "New Moon", icon: "🌑" }
  if (age < 6.63847) return { name: "Waxing Crescent", icon: "🌒" }
  if (age < 8.32625) return { name: "First Quarter", icon: "🌓" }
  if (age < 13.17702) return { name: "Waxing Gibbous", icon: "🌔" }
  if (age < 16.35308) return { name: "Full Moon", icon: "🌕" }
  if (age < 21.19268) return { name: "Waning Gibbous", icon: "🌖" }
  if (age < 22.88111) return { name: "Last Quarter", icon: "🌗" }
  if (age < 27.68641) return { name: "Waning Crescent", icon: "🌘" }
  return { name: "New Moon", icon: "🌑" }
}

function litPath(phase01: number): string {
  const R = 45
  const q = R * Math.sin(phase01 * 2 * Math.PI)
  const sweep = q > 0 ? 1 : 0
  const aq = Math.abs(q).toFixed(2)
  const D = R * 2
  return `M ${R} 0 A ${aq} ${R} 0 0 ${sweep} ${R} ${D} A ${R} ${R} 0 0 1 ${R} 0 Z`
}

export function MoonPhase({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { phase, agePercent, nextFullDays } = useMemo(() => {
    const now = Date.now()
    const days = ((now - NEW_MOON_EPOCH) / 86400000) % SYNODIC_MONTH
    const age = days < 0 ? days + SYNODIC_MONTH : days
    const fullDays = (SYNODIC_MONTH / 2 - age + SYNODIC_MONTH) % SYNODIC_MONTH
    return {
      phase: getPhase(age),
      agePercent: age / SYNODIC_MONTH,
      nextFullDays: Math.min(fullDays, SYNODIC_MONTH - fullDays),
    }
  }, [])

  const dims = size === "lg" ? 110 : size === "sm" ? 48 : 72

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative rounded-full shrink-0"
        style={{ width: dims, height: dims, filter: "drop-shadow(0 0 24px rgba(167,139,250,0.2))" }}
      >
        <svg viewBox="0 0 90 90" className="w-full h-full">
          <defs>
            <radialGradient id="moon-lit" cx="40%" cy="35%" r="80%">
              <stop offset="0%" stopColor="#f7f3ff" />
              <stop offset="55%" stopColor="#dcd1f5" />
              <stop offset="100%" stopColor="#b9a8e8" />
            </radialGradient>
          </defs>
          <circle cx="45" cy="45" r="44" fill="#16161d" />
          <path d={litPath(agePercent)} fill="url(#moon-lit)" />
        </svg>
        <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-[var(--font-grotesk)]">
          Moon of the Day
        </p>
        <p className="font-[var(--font-instrument-serif)] text-lg md:text-xl text-foreground mt-0.5 leading-none">
          {phase.name}
        </p>
        <p className="text-[11px] text-[var(--muted)] mt-1.5">
          {phase.icon} {nextFullDays.toFixed(0)}d to full moon
        </p>
      </div>
    </div>
  )
}
