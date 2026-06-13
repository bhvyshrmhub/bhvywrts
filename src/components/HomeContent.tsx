"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { PenSquare, BookOpen, Clock, Sparkles, ArrowRight, Quote } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { ParticleBackground } from "@/components/ParticleBackground"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function BlurReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)", y: 30 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState({ totalStories: 0, published: 0, totalWords: 0, totalReadingTime: 0 })
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95])

  useEffect(() => {
    fetch("/api/stories?published=true").then((r) => r.json()).then(setStories).catch(() => {})
    fetch("/api/analytics").then((r) => r.json()).then(setStats).catch(() => {})
  }, [])

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="min-h-[90vh] flex flex-col items-center justify-center px-4 pt-24 pb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-sm text-accent"
            >
              <Sparkles className="w-3.5 h-3.5" />
              A space for stories, by Bhavy
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-300 bg-clip-text text-transparent">
                Stories, thoughts,
              </span>
              <br />
              <span className="text-foreground">and worlds crafted with care.</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Every piece begins as a whisper in the dark — a reflection, a memory, a world waiting to be born.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/stories"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition-all font-medium"
              >
                Explore Stories
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border/50 hover:bg-accent/10 transition-all text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="w-4 h-4" />
                Browse Library
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Stories", value: stats.totalStories, icon: BookOpen },
              { label: "Published", value: stats.published, icon: Sparkles },
              { label: "Words Written", value: stats.totalWords.toLocaleString(), icon: PenSquare },
              { label: "Reading Time", value: `${stats.totalReadingTime} min`, icon: Clock },
            ].map((stat, i) => (
              <BlurReveal key={stat.label} delay={i * 0.1}>
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-5 border border-border/30",
                  "bg-card/30 backdrop-blur-sm",
                  "transition-all duration-300",
                  "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </BlurReveal>
            ))}
          </div>
        </section>

        {/* Quote divider */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24">
          <BlurReveal>
            <div className="text-center space-y-4">
              <Quote className="w-8 h-8 text-accent/30 mx-auto" />
              <p className="text-lg sm:text-xl text-muted-foreground/70 font-light italic leading-relaxed">
                "Writing is a way of talking without being interrupted."
              </p>
              <p className="text-xs text-muted-foreground/40">— Jules Renard</p>
            </div>
          </BlurReveal>
        </section>

        {/* Recent Stories */}
        {stories.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
            <BlurReveal className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recent Stories</h2>
                <Link
                  href="/stories"
                  className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.slice(0, 6).map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </BlurReveal>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
          <BlurReveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 p-8 sm:p-12 text-center">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(167,139,250,0.03)_0%,_transparent_70%)]" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Ready to explore?</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Dive into a world of stories, thoughts, and imagination.
                </p>
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition-all font-medium mt-4"
                >
                  <BookOpen className="w-4 h-4" />
                  Explore All Stories
                </Link>
              </div>
            </div>
          </BlurReveal>
        </section>
      </main>

      <FloatingWriteButton />
      <Footer />
    </div>
  )
}
