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
import { ArrowRight, Clock, BookOpen, Sparkles, Moon, Quote } from "lucide-react"
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
        <main className="min-h-screen pt-20">
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
      <main className="min-h-screen">
        {/* Featured Hero */}
        {featured && (
          <section className="relative min-h-[70vh] flex items-end overflow-hidden gradient-bg">
            <Stars count={40} className="z-0" />
            <Butterfly className="absolute z-10" style={{ left: "15%", top: "25%" }} delay={2} size={16} />

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

        {/* About Bhavy Writes */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <Moon className="w-6 h-6 text-accent/60 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-[var(--font-serif)] text-foreground mb-4">
              Welcome to{" "}
              <span className="font-[var(--font-brand)] text-2xl md:text-3xl gradient-text">
                Bhavy Writes
              </span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              A personal sanctuary where stories come alive under the moonlight.
              Every page holds a piece of imagination, every word dances with dreams.
              Here, thoughts become tales, and the quiet hours find their voice.
            </p>
          </motion.div>
        </section>

        {/* Daily Thought */}
        <section className="border-t border-border/50">
          <div className="max-w-3xl mx-auto px-6 py-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-strong rounded-2xl p-8 md:p-12"
            >
              <Quote className="w-5 h-5 text-accent/40 mx-auto mb-4" />
              <p className="text-lg md:text-xl font-[var(--font-serif)] text-foreground leading-relaxed italic">
                &ldquo;{dailyThought}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground/60 mt-4">Daily Thought</p>
            </motion.div>
          </div>
        </section>

        {/* Moon of the Day */}
        <section className="py-16 md:py-20 relative overflow-hidden gradient-bg">
          <Stars count={30} />
          <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-200/30 via-purple-100/20 to-white/10 moon-glow animate-moon-glow mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-[var(--font-serif)] text-foreground">Moon of the Day</h2>
              <p className="text-sm text-muted-foreground mt-2">
                The moon watches over every story written tonight.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen className="w-4 h-4 text-accent" />
              <h2 className="text-2xl font-[var(--font-serif)] text-foreground">Continue Reading</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {continueReading.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Story Collections */}
        {collections.size > 0 && (
          <section className="border-t border-border/50">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <h2 className="text-2xl font-[var(--font-serif)] text-foreground mb-8">Story Collections</h2>
              <div className="space-y-8">
                {Array.from(collections.entries()).map(([collection, collectionStories], ci) => (
                  <motion.div
                    key={collection}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-[var(--font-serif)] text-foreground">{collection}</h3>
                      <Link
                        href={`/stories?collection=${encodeURIComponent(collection)}`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View all <ArrowRight className="w-3 h-3 inline" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {collectionStories.slice(0, 3).map((story, i) => (
                        <StoryCard key={story.id} story={story} index={i} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <section className="border-t border-border/50">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-2xl font-[var(--font-serif)] text-foreground">Featured Stories</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </div>
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

        {/* Empty State */}
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
