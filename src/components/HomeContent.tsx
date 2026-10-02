"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  Feather,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Quote,
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { useAmbientStore } from "@/lib/store"
import {
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  DAILY_THOUGHTS,
  parseStoryTags,
  type CollectionType,
} from "@/lib/constants"
import { cn, formatDate } from "@/lib/utils"
import type { Story } from "@/types"

const CinematicIntro = dynamic(
  () => import("./CinematicIntro").then((mod) => mod.CinematicIntro),
  { ssr: false }
)

function cleanExcerpt(text?: string | null): string {
  if (!text) return ""
  let trimmed = text.trim()
  if (trimmed.endsWith("…") || trimmed.endsWith("...")) {
    trimmed = trimmed.replace(/\.{3}$|…$/, "").trim()
  }
  return trimmed
}

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const setBgImage = useAmbientStore((s) => s.setBgImage)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .eq("published", true)
          .order("createdAt", { ascending: false })
        if (data) {
          setStories(data)
          if (data[0]?.coverImage) {
            setBgImage(data[0].coverImage)
          }
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [setBgImage])

  const latestStory = stories[0] || null

  const recentStories = useMemo(() => {
    if (!latestStory) return []
    return stories.slice(1, 4)
  }, [stories, latestStory])

  const moreStories = useMemo(() => {
    return stories.slice(4, 10)
  }, [stories])

  const collections = useMemo(() => {
    const map = new Map<CollectionType, Story[]>()
    for (const story of stories) {
      const { collection } = parseStoryTags(story.tags)
      if (collection) {
        if (!map.has(collection)) map.set(collection, [])
        map.get(collection)!.push(story)
      }
    }
    return COLLECTIONS.filter((c) => map.has(c)).map((c) => ({
      collection: c,
      stories: map.get(c)!,
    }))
  }, [stories])

  const latestThought = useMemo(() => {
    return DAILY_THOUGHTS[0] || "Some stories are not meant to be told — they are meant to be felt."
  }, [])

  const latestTags = useMemo(
    () => (latestStory ? parseStoryTags(latestStory.tags) : {}),
    [latestStory]
  )

  return (
    <>
      <CinematicIntro coverImage={latestStory?.coverImage} />
      <Navbar />

      {loading ? (
        <main className="min-h-screen pt-28 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8">
          <div className="h-[70vh] rounded-[36px] skeleton" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 rounded-[28px] skeleton" />
            ))}
          </div>
        </main>
      ) : (
        <main className="relative min-h-screen pt-24 md:pt-28 pb-28 space-y-16 md:space-y-24">
          {/* ========================================================= */}
          {/* 1. HERO: LARGE FROSTED-GLASS PANEL (NEWEST ENTRY)          */}
          {/* ========================================================= */}
          {latestStory && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-2 md:pt-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[32px] md:rounded-[36px] glass-strong border border-white/20 shadow-2xl p-6 sm:p-8 md:p-12 lg:p-14"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Story Identity & Controls */}
                  <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
                    {/* Single Eyebrow Badge (No duplicate) */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.24em] font-medium font-[var(--font-grotesk)] border border-[var(--orchid)]/40 bg-[var(--orchid)]/15 text-[var(--orchid)] backdrop-blur-md">
                        <Sparkles className="w-3 h-3" />
                        <span>Newest Entry</span>
                      </span>

                      {latestStory.category && (
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--text-3)] font-[var(--font-grotesk)]">
                          {latestStory.category}
                        </span>
                      )}
                    </div>

                    {/* Big Serif Title */}
                    <h1 className="font-[var(--font-instrument-serif)] text-3xl sm:text-4.5xl md:text-5.5xl lg:text-6xl text-foreground leading-[1.08] tracking-tight">
                      <Link
                        href={`/stories/${latestStory.slug}`}
                        className="hover:text-[var(--orchid)] transition-colors"
                      >
                        {latestStory.title}
                      </Link>
                    </h1>

                    {/* Subtitle / Excerpt clamped to 3 lines (No mid-word cut) */}
                    <p className="text-sm sm:text-base md:text-[17px] text-[var(--text-2)] font-[var(--font-source-serif)] italic leading-relaxed line-clamp-3">
                      {latestStory.subtitle || cleanExcerpt(latestStory.excerpt)}
                    </p>

                    {/* Glass Capsule Row: Date · Reading Time · Chips */}
                    <div className="pt-2">
                      <div className="inline-flex flex-wrap items-center gap-3 px-4 py-2 rounded-full glass border border-white/15 text-xs text-[var(--text-3)] font-[var(--font-grotesk)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--orchid)]" />
                          <span>{formatDate(latestStory.createdAt)}</span>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/30" />
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{latestStory.readingTime || 5} min read</span>
                        </span>
                        {latestTags.mood && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/30" />
                            <span className="text-[var(--text-2)] uppercase tracking-wider text-[10px]">
                              {latestTags.mood}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action: Round Arrow Button "Read the story" */}
                    <div className="pt-3">
                      <Link
                        href={`/stories/${latestStory.slug}`}
                        className="inline-flex items-center gap-3 px-6 sm:px-7 py-3.5 rounded-full bg-foreground text-background font-[var(--font-grotesk)] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-md group w-fit cursor-pointer"
                      >
                        <span>Read the story</span>
                        <div className="w-6 h-6 rounded-full bg-background/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                          <ArrowRight className="w-3.5 h-3.5 text-current" />
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Sharp Cover Image in a Large Rounded Glass Frame */}
                  <div className="lg:col-span-5">
                    <Link
                      href={`/stories/${latestStory.slug}`}
                      className="group block relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] rounded-[28px] overflow-hidden border border-white/25 shadow-xl"
                    >
                      {latestStory.coverImage ? (
                        <img
                          src={latestStory.coverImage}
                          alt={latestStory.title}
                          loading="eager"
                          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                          style={
                            latestTags.coverPos
                              ? {
                                  objectPosition: `${latestTags.coverPos.x}% ${latestTags.coverPos.y}%`,
                                }
                              : undefined
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1b1429] via-[#090710] to-[#1a1224]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Floating circular arrow on photo */}
                      <div className="absolute bottom-4 right-4 w-11 h-11 rounded-full glass-strong border border-white/30 text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 3. GLASS TAGLINE CAPSULE                                  */}
          {/* ========================================================= */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3.5 rounded-full glass border border-white/20 shadow-lg text-xs sm:text-sm text-[var(--text-2)] font-[var(--font-source-serif)] italic backdrop-blur-xl"
            >
              <Feather className="w-4 h-4 text-[var(--orchid)] shrink-0" />
              <span>A digital journal of stories, thoughts and things left unsaid.</span>
            </motion.div>
          </section>

          {/* ========================================================= */}
          {/* 2. ROW OF 3 TALL ROUNDED IMAGE CARDS (RECENT STORIES)      */}
          {/* ========================================================= */}
          {recentStories.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-1.5 font-medium">
                    Fresh Reflections
                  </p>
                  <h2 className="text-2xl md:text-3.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
                    Recent Stories
                  </h2>
                </div>
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-foreground transition-colors group font-[var(--font-grotesk)]"
                >
                  <span>Explore all</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--orchid)] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                {recentStories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* COLLECTIONS PREVIEW                                       */}
          {/* ========================================================= */}
          {collections.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-1.5 font-medium">
                    Series &amp; Themes
                  </p>
                  <h2 className="text-2xl md:text-3.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
                    Featured Collections
                  </h2>
                </div>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--text-2)] hover:text-foreground transition-colors group font-[var(--font-grotesk)]"
                >
                  <span>All collections</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--orchid)] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {collections.slice(0, 4).map(({ collection, stories: colStories }) => {
                  const firstCover = colStories[0]?.coverImage
                  const accent = COLLECTION_ACCENTS[collection] || "var(--orchid)"
                  return (
                    <Link
                      key={collection}
                      href={`/collections/${encodeURIComponent(collection.toLowerCase())}`}
                      className="group block relative overflow-hidden rounded-[26px] aspect-[4/5] border border-[var(--glass-border)] shadow-md hover:-translate-y-1 transition-all duration-500"
                    >
                      {firstCover ? (
                        <img
                          src={firstCover}
                          alt={collection}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, ${accent}30 0%, #07060b 80%)`,
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="glass-strong rounded-[20px] p-3.5 border border-white/20">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-medium font-[var(--font-grotesk)] text-white/80">
                            {colStories.length} {colStories.length === 1 ? "story" : "stories"}
                          </p>
                          <h3 className="font-[var(--font-instrument-serif)] text-lg text-white mt-0.5">
                            {collection}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* 4. BOTTOM GLASS BAR (THE REFERENCE'S BOTTOM BAR)          */}
          {/* ========================================================= */}
          <div className="fixed bottom-4 inset-x-0 z-40 px-4 sm:px-6 pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass-strong rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/25 shadow-[0_16px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 sm:gap-4 backdrop-blur-2xl"
              >
                {/* Left: Avatar / Monogram */}
                <Link
                  href="/about"
                  className="flex items-center gap-3 group shrink-0 focus-visible:outline-none"
                >
                  <div className="w-8 h-8 rounded-full border border-[var(--orchid)]/40 bg-[var(--orchid)]/15 flex items-center justify-center font-[var(--font-great-vibes)] text-lg text-[var(--orchid)] group-hover:scale-105 transition-transform">
                    B
                  </div>
                  <span className="font-[var(--font-instrument-serif)] text-sm sm:text-base text-foreground hidden sm:inline">
                    Bhavya Writes
                  </span>
                </Link>

                {/* Center: Latest Thought or Quote Line */}
                <p className="text-[11px] sm:text-xs text-[var(--text-2)] font-[var(--font-source-serif)] italic line-clamp-1 text-center flex-1 px-2">
                  &ldquo;{latestThought}&rdquo;
                </p>

                {/* Right: Circular ↗ Arrow Button to Stories */}
                <Link
                  href="/stories"
                  aria-label="View all stories"
                  title="View all stories"
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shrink-0 cursor-pointer shadow-sm group"
                >
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </div>
          </div>
        </main>
      )}

      {/* 5. FOOTER IN A GLASS STRIP */}
      <Footer />
      <FloatingWriteButton />
    </>
  )
}
