"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  PenSquare, BookOpen, Clock, Sparkles, ArrowRight, Quote,
  Heart, Star, ChevronRight,
} from "lucide-react"
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

const testimonials = [
  {
    text: "Every story here feels like a window into another world. The writing is immersive and deeply personal.",
    author: "Reader",
    role: "Long-time follower",
    rating: 5,
  },
  {
    text: "Bhavy has a unique voice — thoughtful, poetic, and always compelling. A rare find in today's digital landscape.",
    author: "Fellow Writer",
    role: "Creative partner",
    rating: 5,
  },
  {
    text: "This isn't just a blog — it's a sanctuary for anyone who loves storytelling at its finest.",
    author: "Reader",
    role: "Story enthusiast",
    rating: 5,
  },
]

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState({ totalStories: 0, published: 0, totalWords: 0, totalReadingTime: 0 })
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const heroBlur = useTransform(scrollYProgress, [0, 0.5], ["blur(0px)", "blur(4px)"])

  useEffect(() => {
    fetch("/api/stories?published=true").then((r) => r.json()).then(setStories).catch(() => {})
    fetch("/api/analytics").then((r) => r.json()).then(setStats).catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale, filter: heroBlur }}
          className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden"
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] rounded-full pointer-events-none blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-[25vw] h-[25vw] rounded-full pointer-events-none blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(232,121,249,0.06) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -30, 20, 0],
              y: [0, 30, -20, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 text-center max-w-5xl mx-auto space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary/80 border border-primary/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              A space for stories, by Bhavy
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[0.95]">
                <span className="gradient-text bg-gradient-to-r from-primary via-accent to-secondary">
                  Stories, thoughts,
                </span>
                <br />
                <span className="text-foreground">and worlds</span>
                <br />
                <span className="text-muted-foreground/60 font-[var(--font-playfair)] italic text-4xl sm:text-5xl md:text-6xl">
                  crafted with care.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground/60 max-w-2xl mx-auto leading-relaxed font-light">
                Every piece begins as a whisper in the dark — a reflection, a memory, a world waiting to be born.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/stories"
                className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/25"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <span className="relative z-10 flex items-center gap-2">
                  Explore Stories
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/stories"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl glass text-muted-foreground hover:text-foreground hover:glass-strong transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Browse Library
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
              <motion.div className="w-1 h-2 rounded-full bg-primary/50" />
            </div>
          </motion.div>
        </motion.section>

        {/* Stats */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16 sm:pb-24">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Total Stories", value: stats.totalStories, icon: BookOpen },
              { label: "Published", value: stats.published, icon: Sparkles },
              { label: "Words Written", value: stats.totalWords.toLocaleString(), icon: PenSquare },
              { label: "Reading Time", value: `${stats.totalReadingTime} min`, icon: Clock },
            ].map((stat, i) => (
              <BlurReveal key={stat.label} delay={i * 0.1}>
                <div className={cn(
                  "relative overflow-hidden rounded-2xl p-5 sm:p-6",
                  "glass-card",
                  "elevation-1 hover:elevation-3",
                  "transition-all duration-500",
                  "group"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                    <motion.div
                      className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-primary/30" />
                    </motion.div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground/50 mt-1">{stat.label}</div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </BlurReveal>
            ))}
          </div>
        </section>

        {/* Quote divider */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-20 sm:pb-28">
          <BlurReveal>
            <div className="text-center space-y-5">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Quote className="w-10 h-10 text-primary/20 mx-auto" />
              </motion.div>
              <p className="text-xl sm:text-2xl text-muted-foreground/50 font-[var(--font-playfair)] italic leading-relaxed">
                &ldquo;Writing is a way of talking without being interrupted.&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/30 tracking-widest uppercase">&mdash; Jules Renard</p>
            </div>
          </BlurReveal>
        </section>

        {/* Testimonials */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-20 sm:pb-28">
          <BlurReveal>
            <div className="text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">What readers say</h2>
                <p className="text-sm text-muted-foreground/50">Words from those who read.</p>
              </div>

              <div className="relative overflow-hidden min-h-[140px]">
                <AnimatedTestimonial
                  testimonials={testimonials}
                  currentIndex={testimonialIndex}
                />
              </div>

              <div className="flex items-center justify-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      i === testimonialIndex
                        ? "bg-primary w-6"
                        : "bg-white/10 hover:bg-white/20"
                    )}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </BlurReveal>
        </section>

        {/* Recent Stories */}
        {stories.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 sm:pb-28">
            <BlurReveal className="space-y-8 sm:space-y-10">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recent Stories</h2>
                  <p className="text-sm text-muted-foreground/50">The latest from the pen.</p>
                </div>
                <Link
                  href="/stories"
                  className="group inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary transition-colors"
                >
                  View all
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {stories.slice(0, 6).map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </BlurReveal>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24 sm:pb-32">
          <BlurReveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 glass-card p-8 sm:p-14 text-center">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10 space-y-5">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BookOpen className="w-10 h-10 text-primary/30 mx-auto" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Ready to explore?</h2>
                <p className="text-muted-foreground/60 max-w-md mx-auto text-sm leading-relaxed">
                  Dive into a world of stories, thoughts, and imagination.
                </p>
                <Link
                  href="/stories"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium hover:shadow-xl hover:shadow-primary/25 transition-all overflow-hidden relative"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Explore All Stories
                  </span>
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

function AnimatedTestimonial({
  testimonials,
  currentIndex,
}: {
  testimonials: { text: string; author: string; role: string; rating: number }[]
  currentIndex: number
}) {
  return (
    <div className="relative">
      {testimonials.map((t, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)", scale: 0.95 }}
          animate={
            i === currentIndex
              ? { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
              : { opacity: 0, y: -20, filter: "blur(8px)", scale: 0.95 }
          }
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: i === currentIndex ? "auto" : "none" }}
        >
          <div className="space-y-4 text-center max-w-xl">
            <div className="flex items-center justify-center gap-0.5">
              {Array.from({ length: t.rating }).map((_, s) => (
                <Star key={s} className="w-4 h-4 fill-primary/60 text-primary/60" />
              ))}
            </div>
            <p className="text-base sm:text-lg text-muted-foreground/70 leading-relaxed italic font-light">
              &ldquo;{t.text}&rdquo;
            </p>
            <div>
              <p className="text-sm font-medium text-foreground/80">{t.author}</p>
              <p className="text-xs text-muted-foreground/40">{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}