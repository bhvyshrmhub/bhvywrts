"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BookOpen, Sparkles, Heart } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function SkeletonCard() {
  return <div className="h-80 rounded-[24px] skeleton border border-[var(--border)]" />
}

export default function StoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  // Preserve old shared links like /stories?collection=...
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const collection = params.get("collection")
    if (collection) {
      router.replace(`/collections/${encodeURIComponent(collection.toLowerCase())}`, { scroll: false })
    }
  }, [router])

  // Load favorites from local storage
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("bhavy-favorites") || "[]")
      if (Array.isArray(favs)) setFavoriteIds(favs)
    } catch {}
  }, [])

  const fetchStories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/stories?published=true")
      const data = await res.json()
      setStories(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  // Extract unique categories from stories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    for (const story of stories) {
      if (story.category && story.category.trim()) {
        cats.add(story.category.trim())
      }
    }
    return Array.from(cats).sort()
  }, [stories])

  // Filtered stories based on selected category or favorites
  const filteredStories = useMemo(() => {
    if (selectedCategory === "all") return stories
    if (selectedCategory === "favorites") {
      return stories.filter((s) => favoriteIds.includes(s.id))
    }
    return stories.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase())
  }, [stories, selectedCategory, favoriteIds])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />

      {/* Subtle Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[-10%] right-[10%] w-[500px] h-[350px] rounded-full blur-[140px] opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, #e879f9 0%, #a855f7 50%, transparent 70%)",
          }}
        />
      </div>

      <main className="relative z-10 pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10 md:mb-12"
          >
            <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-3 font-medium">
              The Archive
            </p>
            <h1 className="text-4xl md:text-5.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
              Stories
            </h1>
            <p className="text-sm md:text-base text-[var(--foreground-secondary)] mt-3.5 max-w-md mx-auto leading-relaxed font-[var(--font-source-serif)] italic">
              Every page of this journal, waiting to be read.
            </p>
          </motion.div>

          {/* Category Filter Bar */}
          {!loading && stories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex items-center justify-center gap-1.5 flex-wrap mb-10"
            >
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)]",
                  selectedCategory === "all"
                    ? "bg-foreground text-background shadow-sm"
                    : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary/70 border border-transparent"
                )}
              >
                All ({stories.length})
              </button>

              {categories.map((cat) => {
                const count = stories.filter((s) => s.category?.toLowerCase() === cat.toLowerCase()).length
                const active = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)]",
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary/70 border border-transparent"
                    )}
                  >
                    {cat} ({count})
                  </button>
                )
              })}

              {favoriteIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory("favorites")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)]",
                    selectedCategory === "favorites"
                      ? "bg-[var(--orchid)] text-white shadow-sm"
                      : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary/70"
                  )}
                >
                  <Heart className="w-3 h-3" fill={selectedCategory === "favorites" ? "currentColor" : "none"} />
                  Favorites ({stories.filter((s) => favoriteIds.includes(s.id)).length})
                </button>
              )}
            </motion.div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 glass-card rounded-[28px] max-w-md mx-auto p-8"
            >
              <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-[var(--font-instrument-serif)] text-foreground">
                No stories in this view
              </h3>
              <p className="text-xs text-[var(--muted)] mt-2">
                Try selecting &ldquo;All&rdquo; to view the complete journal.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="mt-6 px-4 py-2 rounded-full border border-[var(--border-strong)] text-xs text-foreground hover:bg-secondary font-[var(--font-grotesk)]"
              >
                Reset filter
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            >
              {filteredStories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
