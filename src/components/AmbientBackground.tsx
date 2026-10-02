"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAmbientStore } from "@/lib/store"

interface AmbientBackgroundProps {
  coverImage?: string | null
}

const DEFAULT_GRADIENT_COVER =
  "https://zyuubroahspccwrufzub.supabase.co/storage/v1/object/public/covers/1789790749402-mnvzdwleln8.jpg"

export function AmbientBackground({ coverImage }: AmbientBackgroundProps) {
  const storeImage = useAmbientStore((s) => s.bgImage)
  const [mounted, setMounted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Use explicit prop if passed, otherwise store image, otherwise default
  const activeImage = coverImage !== undefined ? coverImage : storeImage

  useEffect(() => {
    setMounted(true)
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(media.matches)
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    media.addEventListener("change", listener)
    return () => media.removeEventListener("change", listener)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[var(--bg-base)]"
      aria-hidden="true"
    >
      {/* LAYER 1: Full-Bleed Photograph (Cross-fades 600ms) */}
      <AnimatePresence mode="popLayout">
        {activeImage && (
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            <img
              src={activeImage}
              alt=""
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover scale-[1.12] origin-center blur-[40px] saturate-[1.4] brightness-[0.52] dark:brightness-[0.52] dark:opacity-100 light:brightness-[1.05] light:opacity-55 transition-[filter,opacity] duration-700"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LAYER 2: Colorful Soft Aurora Gradient Blobs (Orchid, Violet, Amber) */}
      <div className="absolute inset-0 overflow-hidden mix-blend-screen dark:mix-blend-screen light:mix-blend-multiply opacity-80">
        {/* Blob 1 — Orchid #E879F9 (Top Right) */}
        <div
          className={`absolute -top-[12%] -right-[8%] w-[58rem] h-[58rem] rounded-full blur-[90px] opacity-25 dark:opacity-25 light:opacity-20 ${
            prefersReducedMotion ? "" : "animate-aurora-1"
          }`}
          style={{
            background:
              "radial-gradient(circle, #e879f9 0%, rgba(232,121,249,0.5) 45%, transparent 70%)",
          }}
        />

        {/* Blob 2 — Violet #A78BFA (Mid Left) */}
        <div
          className={`absolute top-[25%] -left-[15%] w-[54rem] h-[54rem] rounded-full blur-[100px] opacity-25 dark:opacity-25 light:opacity-20 ${
            prefersReducedMotion ? "" : "animate-aurora-2"
          }`}
          style={{
            background:
              "radial-gradient(circle, #a78bfa 0%, rgba(167,139,250,0.4) 50%, transparent 75%)",
          }}
        />

        {/* Blob 3 — Warm Amber #F5B97A (Bottom Center/Right) */}
        <div
          className={`absolute -bottom-[15%] right-[10%] w-[52rem] h-[52rem] rounded-full blur-[90px] opacity-20 dark:opacity-20 light:opacity-25 ${
            prefersReducedMotion ? "" : "animate-aurora-3"
          }`}
          style={{
            background:
              "radial-gradient(circle, #f5b97a 0%, rgba(245,185,122,0.45) 45%, transparent 70%)",
          }}
        />
      </div>

      {/* LAYER 3: Film Grain Texture (4% static SVG noise) */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* LAYER 4: Vignette Gradient for Text Legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 45%, transparent 35%, rgba(7,6,11,0.55) 100%)",
        }}
      />
    </div>
  )
}
