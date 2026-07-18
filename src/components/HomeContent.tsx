"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { ReadingProgress } from "./ReadingProgress"
import { Stars } from "./Stars"
import { Butterfly } from "./Butterfly"
import { ArrowRight, Clock, BookOpen, Sparkles, Quote } from "lucide-react"
import Link from "next/link"
import { DAILY_THOUGHTS, COLLECTIONS, parseStoryTags, type CollectionType } from "@/lib/constants"
import type { Story } from "@/types"

function getDailyThought(): string {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
  return DAILY_THOUGHTS[dayOfYear % DAILY_THOUGHTS.length]
}

function getReadingHistory(): string[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("bhavy-reading-history") || "[]")
}

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [featured, setFeatured] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const dailyThought = useMemo(() => getDailyThought(), [])
  const [readingHistory, setReadingHistory] = useState<string[]>([])

  useEffect(() => {
    setReadingHistory(getReadingHistory())
  }, [])

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

  const latest = stories.slice(1, 7)
  const featuredStories = stories.filter((s) => s.featured && s.slug !== featured?.slug).slice(0, 3)
  const continueReading = readingHistory.length > 0
    ? stories.filter((s) => readingHistory.includes(s.slug)).slice(0, 3)
    : []

  const collections = useMemo(() => {
    const map = new Map<CollectionType, Story[]>()
    for (const story of stories) {
      const { collection } = parseStoryTags(story.tags)
      if (collection) {
        if (!map.has(collection)) map.set(collection, [])
        map.get(collection)!.push(story)
      }
    }
    return map
  }, [stories])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-16 px-5">
          <div className="max-w-6xl mx-auto py-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-3xl skeleton" />
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
      <main className="min-h-screen">
        {/* About + Daily Thought + Featured — compact section */}
        <section className="relative overflow-hidden">
          {/* Single subtle moon behind content */}
          <div className="absolute -top-16 right-0 z-0 pointer-events-none">
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-300/8 via-blue-200/6 to-transparent moon-glow animate-moon-glow" style={{ boxShadow: "0 0 40px rgba(167, 139, 250, 0.06), 0 0 80px rgba(167, 139, 250, 0.03)" }} />
            </div>
          </div>
          <Stars count={25} />

          <div className="relative z-10 max-w-6xl mx-auto px-5 pt-6 pb-4">
            {/* About — 2-3 lines */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5"
            >
              <h1 className="text-xl md:text-2xl font-[var(--font-serif)] text-foreground">
                A personal sanctuary for{" "}
                <span className="font-[var(--font-brand)] gradient-logo text-lg md:text-xl">stories</span>
              </h1>
              <p className="text-sm text-muted-foreground/70 mt-1 leading-relaxed max-w-lg">
                Thoughts become tales under the moonlight.
              </p>
            </motion.div>

            {/* Daily Thought */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-5"
            >
              <div className="glass rounded-2xl px-5 py-4" style={{ borderRadius: 24 }}>
                <div className="flex items-start gap-3">
                  <Quote className="w-3.5 h-3.5 text-purple-400/40 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    &ldquo;{dailyThought}&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Featured Story — compact card */}
            {featured && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href={`/stories/${featured.slug}`} className="group block">
                  <div
                    className="relative overflow-hidden"
                    style={{ borderRadius: 28, boxShadow: "0 4px 24px rgba(139, 92, 246, 0.08)" }}
                  >
                    {featured.coverImage ? (
                      <div className="aspect-[21/8] md:aspect-[3/1] relative">
                        <img
                          src={featured.coverImage}
                          alt={featured.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                      </div>
                    ) : (
                      <div className="aspect-[21/8] md:aspect-[3/1] relative bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-pink-900/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-4 md:p-8 w-full">
                        <span className="text-[9px] font-medium text-purple-300/80 uppercase tracking-[0.2em] mb-1 block">
                          {featured.category || "Featured"}
                        </span>
                        <h2 className="text-base md:text-2xl font-[var(--font-serif)] text-white leading-snug max-w-xl line-clamp-2">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-xs text-white/50 mt-1 max-w-lg line-clamp-1 md:line-clamp-2">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-white/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {featured.readingTime || "5"} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </section>

        {/* Latest Stories */}
        <section className="max-w-6xl mx-auto px-5 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-[var(--font-serif)] text-foreground">Latest</h2>
            <Link
              href="/stories"
              className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {latest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 py-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-3.5 h-3.5 text-purple-400/60" />
              <h2 className="text-lg font-[var(--font-serif)] text-foreground">Continue Reading</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {continueReading.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 py-6 border-t border-border/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-blue-400/60" />
              <h2 className="text-lg font-[var(--font-serif)] text-foreground">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredStories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Story Collections */}
        {collections.size > 0 && (
          <section className="max-w-6xl mx-auto px-5 py-6 border-t border-border/30">
            <h2 className="text-lg font-[var(--font-serif)] text-foreground mb-4">Collections</h2>
            <div className="space-y-5">
              {Array.from(collections.entries()).map(([collection, collectionStories], ci) => (
                <motion.div
                  key={collection}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-[var(--font-serif)] text-foreground/80">{collection}</h3>
                    <Link
                      href={`/stories?collection=${encodeURIComponent(collection)}`}
                      className="text-[10px] text-muted-foreground/50 hover:text-foreground transition-colors"
                    >
                      View all <ArrowRight className="w-2.5 h-2.5 inline" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {collectionStories.slice(0, 3).map((story, i) => (
                      <StoryCard key={story.id} story={story} index={i} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {stories.length === 0 && !loading && (
          <div className="px-5 py-16 text-center relative">
            <Stars count={15} />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/5 moon-glow mx-auto mb-3 animate-moon-glow" />
              <BookOpen className="w-6 h-6 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50">No stories yet. The first page awaits.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </>
  )
}
