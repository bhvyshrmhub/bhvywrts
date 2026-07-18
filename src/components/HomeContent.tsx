"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { ReadingProgress } from "./ReadingProgress"
import { Stars } from "./Stars"
import { Butterfly } from "./Butterfly"
import { ArrowRight, TrendingUp, Clock, Sparkles, BookOpen } from "lucide-react"
import Link from "next/link"
import type { Story } from "@/types"

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [featured, setFeatured] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .order("createdAt", { ascending: false })
        if (data) setStories(data)
        if (data && data.length > 0) setFeatured(data[0])
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const categories = [...new Set(stories.map(s => s.category).filter(Boolean))] as string[]
  const latest = stories.slice(1, 7)
  const editorsPicks = stories.filter(s => s.category === "Poetry" || s.category === "Philosophy").slice(0, 3)

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 pb-20">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl skeleton mb-6" />
            ))}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <ReadingProgress />
      <main className="min-h-screen pb-20 md:pb-0">
        {/* Featured Hero */}
        {featured && (
          <section className="relative min-h-[70vh] flex items-end overflow-hidden gradient-bg">
            <Stars count={40} className="z-0" />
            <Butterfly className="absolute z-10" style={{ left: "15%", top: "25%" }} delay={2} size={16} />

            {/* Moon */}
            <div className="absolute top-20 right-[15%] z-0 pointer-events-none">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-200/40 via-purple-100/30 to-white/20 moon-glow animate-moon-glow" />
              </div>
            </div>

            <Link href={`/stories/${featured.slug}`} className="group relative z-10 w-full">
              <div className="relative w-full">
                {featured.coverImage ? (
                  <div className="absolute inset-0">
                    <img
                      src={featured.coverImage}
                      alt={featured.title}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                )}
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 relative">
                  <div className="max-w-2xl">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-block text-[10px] font-medium text-accent uppercase tracking-[0.25em] mb-4"
                    >
                      {featured.category || "Featured Story"}
                    </motion.span>
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="text-4xl md:text-6xl font-[var(--font-serif)] text-foreground leading-tight mb-4"
                    >
                      {featured.title}
                    </motion.h1>
                    {featured.excerpt && (
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-sm md:text-base text-muted-foreground max-w-lg line-clamp-2 leading-relaxed"
                      >
                        {featured.excerpt}
                      </motion.p>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="flex items-center gap-3 mt-6"
                    >
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.readingTime || "5"} min read
                      </span>
                      <span className="text-muted-foreground/40">&middot;</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(featured.createdAt).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric"
                        })}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Link>

            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10" />
          </section>
        )}

        {/* Latest Stories */}
        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-[var(--font-serif)] text-foreground">Latest Stories</h2>
            <Link
              href="/stories"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>

        {/* Editor's Picks */}
        {editorsPicks.length > 0 && (
          <section className="border-t border-border/50">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-2xl font-[var(--font-serif)] text-foreground">Editor&apos;s Picks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editorsPicks.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="border-t border-border/50">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <h2 className="text-2xl font-[var(--font-serif)] text-foreground mb-8">Browse by Category</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/stories?category=${encodeURIComponent(cat)}`}
                      className="px-4 py-2 text-sm rounded-xl glass hover:bg-secondary transition-colors"
                    >
                      {cat}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {stories.length === 0 && !loading && (
          <div className="max-w-6xl mx-auto px-6 py-24 text-center relative">
            <Stars count={20} />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200/30 to-purple-100/20 moon-glow mx-auto mb-4 animate-moon-glow" />
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No stories yet. The first page awaits.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </>
  )
}