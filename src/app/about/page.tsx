"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Feather, BookOpen, Quote, Sparkles, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { ReadingProgress } from "@/components/ReadingProgress"
import { supabase } from "@/lib/supabase-client"

const TIMELINE = [
  {
    year: "The Beginning",
    text: "First thought written down at 2 AM. A blank page and no reason to stop.",
  },
  {
    year: "The First Stories",
    text: "Short worlds built in the dark — dreamt, typed, saved, and quietly abandoned.",
  },
  {
    year: "Finding the Voice",
    text: "The writing stopped trying to be anything and finally became mine.",
  },
  {
    year: "Bhavya Writes",
    text: "This journal — a place to leave pieces of myself without fear.",
  },
]

export default function AboutPage() {
  const [storyCount, setStoryCount] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from("Story").select("wordCount").eq("published", true)
        if (data) {
          setStoryCount(data.length)
          setWordCount(data.reduce((acc: number, s) => acc + (s.wordCount || 0), 0))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[140px] opacity-[0.07]"
          style={{
            background: "radial-gradient(circle, #e879f9 0%, #a855f7 50%, transparent 70%)",
          }}
        />
      </div>

      <main className="relative z-10 pt-28 md:pt-36 pb-16">
        <div className="max-w-2xl mx-auto px-5 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 md:mb-16"
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-3 font-medium">
              About
            </p>
            <h1 className="text-4xl md:text-5.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
              A Letter
            </h1>
          </motion.div>

          {/* The letter card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-[24px] md:rounded-[32px] p-7 sm:p-10 md:p-12 border border-[var(--border)] shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="font-[var(--font-source-serif)] text-[16px] md:text-[17.5px] leading-[1.85] text-[var(--foreground-secondary)] space-y-6">
              <p className="text-foreground text-2xl md:text-3xl font-[var(--font-instrument-serif)]">
                Dear Reader,
              </p>
              <p>
                Bhavya Writes is where I leave pieces of myself. Every story here is a thought that
                wouldn&apos;t leave me alone, a feeling that needed somewhere to go, a night I couldn&apos;t
                sleep and chose instead to write.
              </p>
              <p>
                I don&apos;t write for an audience. I write because the page is the only place where I can be
                completely honest — where I can say the thing, then decide whether anyone ever reads it.
              </p>
              <p>
                Some of these are fiction. Some are truer than anything I&apos;ve ever said aloud. I&apos;ll let
                you guess which are which.
              </p>
              <p>
                Thank you for stepping into this quiet corner of the internet. Sit for a while. The moon
                is out.
              </p>
              <div className="pt-2">
                <p className="font-[var(--font-great-vibes)] text-3.5xl md:text-4.5xl gradient-logo">
                  Bhavya
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4 mt-8"
          >
            <div className="glass-card rounded-[22px] md:rounded-[26px] p-6 text-center border border-[var(--border)]">
              <Feather className="w-5 h-5 text-[var(--orchid)] mx-auto mb-2.5" />
              <p className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl text-foreground">
                {loading ? "—" : storyCount}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1.5 font-[var(--font-grotesk)]">Stories written</p>
            </div>
            <div className="glass-card rounded-[22px] md:rounded-[26px] p-6 text-center border border-[var(--border)]">
              <BookOpen className="w-5 h-5 text-[var(--orchid)] mx-auto mb-2.5" />
              <p className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl text-foreground">
                {loading ? "—" : wordCount.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1.5 font-[var(--font-grotesk)]">Words published</p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-14"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-7 font-medium">
              The Road So Far
            </p>
            <div className="space-y-7 relative before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-[var(--border)]">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative pl-8"
                >
                  <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-[var(--background)] bg-[var(--orchid)] shadow-[0_0_10px_rgba(232,121,249,0.3)]" />
                  <h3 className="font-[var(--font-instrument-serif)] text-xl text-foreground">{item.year}</h3>
                  <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mt-1 leading-relaxed font-[var(--font-source-serif)]">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-14 glass-card rounded-[24px] md:rounded-[28px] p-7 md:p-9 border border-[var(--border)]"
          >
            <Quote className="w-6 h-6 text-[var(--orchid)] mb-3 opacity-70" />
            <p className="font-[var(--font-instrument-serif)] italic text-xl md:text-2xl text-foreground leading-relaxed">
              &ldquo;A story is a room you build so someone else can rest in it.&rdquo;
            </p>
            <div className="mt-5 pt-5 border-t border-[var(--border)]">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-[var(--font-grotesk)] mb-2">
                Writing Philosophy
              </p>
              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed font-[var(--font-source-serif)]">
                Write like no one is reading. Edit like everyone will. Keep the heart of it, always.
              </p>
            </div>
          </motion.div>

          {/* Bottom Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-14 text-center"
          >
            <Sparkles className="w-5 h-5 text-[var(--orchid)] mx-auto mb-3" />
            <p className="font-[var(--font-instrument-serif)] italic text-lg text-[var(--foreground-secondary)]">
              If you made it this far, maybe read one.
            </p>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background text-xs sm:text-sm font-medium px-6 py-3 mt-5 hover:opacity-90 transition-all font-[var(--font-grotesk)] shadow-sm active:scale-95"
            >
              <span>Browse the journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
