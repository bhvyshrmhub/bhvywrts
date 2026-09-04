"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Logo } from "@/components/Logo"
import { Stars } from "@/components/Stars"

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-5">
      <Stars count={30} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* Moon */}
        <div className="relative mx-auto mb-10 w-28 h-28">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="w-full h-full rounded-full animate-moon-glow"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fff5f9 0%, #f5dde8 45%, #e8c4d5 100%)",
              boxShadow: "0 0 50px rgba(255,182,217,0.2), 0 0 120px rgba(255,182,217,0.1)",
            }}
          />
          <div className="absolute top-[30%] left-[25%] w-3.5 h-3.5 rounded-full bg-black/10" />
          <div className="absolute bottom-[26%] right-[24%] w-2.5 h-2.5 rounded-full bg-black/8" />
          <div className="absolute top-[58%] left-[52%] w-2 h-2 rounded-full bg-black/8" />
        </div>

        <p className="font-[var(--font-instrument-serif)] italic text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed">
          &ldquo;Every lost page is just a story
          <br />
          waiting to be written.&rdquo;
        </p>

        <div className="my-8 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-6">
          This page wandered off into the dark
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-medium px-6 py-3 hover:bg-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return home
        </Link>

        <div className="mt-10 opacity-60">
          <Logo href="/" size="sm" />
        </div>
      </motion.div>
    </div>
  )
}
