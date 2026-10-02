"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Moon, ArrowRight, FolderOpen, Sparkles, BookOpen } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { ReadingProgress } from "@/components/ReadingProgress"
import { supabase } from "@/lib/supabase-client"
import {
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  parseStoryTags,
  type CollectionType,
} from "@/lib/constants"
import type { Story } from "@/types"

export default function CollectionsPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .eq("published", true)
          .order("createdAt", { ascending: false })
        if (data) setStories(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

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

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />

      <main className="relative z-10 pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-3 font-medium">
              Series &amp; Themes
            </p>
            <h1 className="text-4xl md:text-5.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
              Collections
            </h1>
            <p className="text-sm md:text-base text-[var(--text-2)] mt-3.5 max-w-md mx-auto leading-relaxed font-[var(--font-source-serif)] italic">
              Groups of stories that belong to the same world, mood, or season of the heart.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 rounded-[32px] skeleton border border-white/15" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-[32px] max-w-md mx-auto p-8 border border-white/20 shadow-xl">
              <Moon className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-50" />
              <p className="text-xl font-[var(--font-instrument-serif)] text-foreground">
                Some stories are still waiting for a home.
              </p>
              <p className="text-xs text-[var(--text-3)] mt-2 font-[var(--font-source-serif)]">
                Collections will appear here as stories find their place.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-8">
              {collections.map(({ collection, stories: colStories }, i) => {
                const accent = COLLECTION_ACCENTS[collection] || "#e879f9"
                const firstStory = colStories[0]
                return (
                  <motion.div
                    key={collection}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: (i % 2) * 0.08 }}
                  >
                    <Link
                      href={`/collections/${encodeURIComponent(collection.toLowerCase())}`}
                      className="group block h-full focus-visible:outline-none"
                    >
                      <div className="glass-card overflow-hidden h-full rounded-[32px] border border-[var(--glass-border)] group-hover:border-white/30 transition-all duration-500 shadow-lg flex flex-col justify-between">
                        {/* Book Cover Image Area */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#09090c]">
                          {firstStory?.coverImage ? (
                            <img
                              src={firstStory.coverImage}
                              alt={collection}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.05]"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ background: `linear-gradient(140deg, ${accent}25 0%, #07060b 80%)` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />

                          {/* Top Tag */}
                          <div className="absolute top-5 left-5 flex items-center gap-2">
                            <span className="glass-pill px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-medium text-white font-[var(--font-grotesk)] border border-white/20">
                              Collection
                            </span>
                          </div>

                          {/* Overlaid Frosted Glass Title Capsule */}
                          <div className="absolute inset-x-5 bottom-5">
                            <div className="glass-strong rounded-[24px] p-4.5 border border-white/25 shadow-xl backdrop-blur-xl">
                              <h2 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-white leading-tight">
                                {collection}
                              </h2>
                              <p className="text-[11px] text-white/80 font-[var(--font-grotesk)] uppercase tracking-wider mt-1">
                                {colStories.length} {colStories.length === 1 ? "story" : "stories"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Description Strip */}
                        <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                          <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed font-[var(--font-source-serif)] italic">
                            {COLLECTION_DESCRIPTIONS[collection]}
                          </p>

                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--glass-border)]">
                            <span className="text-xs text-[var(--text-3)] font-[var(--font-grotesk)]">
                              Curated series
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-medium font-[var(--font-grotesk)] transition-all duration-300 group-hover:translate-x-1"
                              style={{ color: accent }}
                            >
                              <span>Explore stories</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
