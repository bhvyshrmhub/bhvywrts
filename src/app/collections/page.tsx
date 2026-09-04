"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Moon, ArrowRight, FolderOpen } from "lucide-react"
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
    return COLLECTIONS.filter((c) => map.has(c)).map((c) => ({ collection: c, stories: map.get(c)! }))
  }, [stories])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)] font-[var(--font-grotesk)] mb-4">
              Series &amp; Themes
            </p>
            <h1 className="text-4xl md:text-6xl text-foreground">Collections</h1>
            <p className="text-sm md:text-base text-[var(--foreground-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
              Groups of stories that belong to the same world, mood, or season of the heart.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 rounded-[28px] skeleton" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-24">
              <Moon className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
              <p className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                Some stories are still waiting for a home.
              </p>
              <p className="text-sm text-[var(--muted)] mt-2">
                Collections will appear here as stories find their place.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map(({ collection, stories: colStories }, i) => {
                const accent = COLLECTION_ACCENTS[collection]
                return (
                  <motion.div
                    key={collection}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: (i % 2) * 0.08 }}
                  >
                    <Link
                      href={`/collections/${encodeURIComponent(collection.toLowerCase())}`}
                      className="group block h-full"
                    >
                      <div
                        className="glass-card overflow-hidden h-full hover-lift"
                        style={{ borderRadius: 28 }}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0a0c]">
                          {colStories[0]?.coverImage ? (
                            <img
                              src={colStories[0].coverImage}
                              alt={collection}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                            />
                          ) : (
                            <div
                              className="w-full h-full"
                              style={{ background: `linear-gradient(140deg, ${accent}22 0%, #0a0a0c 70%)` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                          <div className="absolute top-5 left-6 flex items-center gap-2">
                            <Moon className="w-4 h-4" style={{ color: accent }} />
                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/80 font-[var(--font-grotesk)]">
                              Collection
                            </span>
                          </div>
                          <div className="absolute bottom-5 left-6 right-6">
                            <h2 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-white leading-tight">
                              {collection}
                            </h2>
                          </div>
                          <div className="absolute inset-x-6 bottom-0" style={{ borderBottom: `2px solid ${accent}45` }} />
                        </div>
                        <div className="p-6 md:p-7">
                          <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                            {COLLECTION_DESCRIPTIONS[collection]}
                          </p>
                          <div className="flex items-center justify-between mt-5">
                            <span className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
                              {colStories.length} {colStories.length === 1 ? "story" : "stories"}
                            </span>
                            <span
                              className="inline-flex items-center gap-1.5 text-xs transition-all duration-300 group-hover:gap-2.5"
                              style={{ color: accent }}
                            >
                              Open
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
