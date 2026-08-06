"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Feather, BookOpen, Quote, Sparkles } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { ReadingProgress } from "@/components/ReadingProgress"
import { Stars } from "@/components/Stars"
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
      <main className="pt-24 md:pt-32 pb-10">
        <Stars count={16} />
        <div className="max-w-2xl mx-auto px-5 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)] font-[var(--font-grotesk)] mb-4">
              About
            </p>
            <h1 className="text-4xl md:text-6xl text-foreground">A Letter</h1>
          </motion.div>

          {/* The letter */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-[var(--font-source-serif)] text-[17px] md:text-lg leading-[1.9] text-[var(--foreground-secondary)] space-y-7"
          >
            <p className="text-foreground text-xl md:text-2xl font-[var(--font-instrument-serif)]">
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
            <p className="font-[var(--font-great-vibes)] text-3xl text-[var(--lavender)] pt-2">
              Bhavya
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4 mt-16"
          >
            <div className="glass-card rounded-3xl p-7 text-center">
              <Feather className="w-5 h-5 text-[var(--orchid)] mx-auto mb-3" />
              <p className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl text-foreground">
                {loading ? "—" : storyCount}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1.5 font-[var(--font-grotesk)]">Stories written</p>
            </div>
            <div className="glass-card rounded-3xl p-7 text-center">
              <BookOpen className="w-5 h-5 text-[var(--soft-cyan)] mx-auto mb-3" />
              <p className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl text-foreground">
                {loading ? "—" : wordCount.toLocaleString()}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1.5 font-[var(--font-grotesk)]">Words published</p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-8">
              The Road So Far
            </p>
            <div className="space-y-8 relative before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-white/[0.07]">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.06 }}
                  className="relative pl-8"
                >
                  <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border border-[var(--orchid)]/40 bg-black" />
                  <h3 className="font-[var(--font-instrument-serif)] text-lg text-foreground">{item.year}</h3>
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1.5 leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quote + philosophy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-16 glass-card rounded-[28px] p-8 md:p-10"
          >
            <Quote className="w-6 h-6 text-[var(--lavender)] mb-4" />
            <p className="font-[var(--font-instrument-serif)] italic text-xl md:text-2xl text-foreground leading-relaxed">
              &ldquo;A story is a room you build so someone else can rest in it.&rdquo;
            </p>
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-3">
                Writing Philosophy
              </p>
              <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                Write like no one is reading. Edit like everyone will. Keep the heart of it, always.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="mt-16 text-center"
          >
            <Sparkles className="w-5 h-5 text-[var(--orchid)] mx-auto mb-4" />
            <p className="font-[var(--font-instrument-serif)] italic text-lg text-[var(--foreground-secondary)]">
              If you made it this far, maybe read one.
            </p>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-medium px-6 py-3 mt-6 hover:bg-white/90 transition-colors"
            >
              Browse the journal
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
