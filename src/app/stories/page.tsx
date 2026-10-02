"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BookOpen, Sparkles, Heart, Search, X } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function SkeletonCard() {
  return <div className="aspect-[4/5] min-h-[420px] rounded-[28px] skeleton border border-white/15" />
}

export default function StoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
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

  // Filtered stories based on selected category, favorites, and search query
  const filteredStories = useMemo(() => {
    let result = stories

    if (selectedCategory === "favorites") {
      result = result.filter((s) => favoriteIds.includes(s.id))
    } else if (selectedCategory !== "all") {
      result = result.filter(
        (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle?.toLowerCase().includes(q) ||
          s.excerpt?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      )
    }

    return result
  }, [stories, selectedCategory, favoriteIds, searchQuery])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />

      <main className="relative z-10 pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-20">
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
            <p className="text-sm md:text-base text-[var(--text-2)] mt-3.5 max-w-md mx-auto leading-relaxed font-[var(--font-source-serif)] italic">
              Every page of this journal, waiting to be read.
            </p>
          </motion.div>

          {/* Frosted Glass Filter & Search Bar */}
          {!loading && stories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center gap-4 mb-12"
            >
              {/* Search Capsule */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories, excerpts, ideas..."
                  className="w-full h-11 pl-11 pr-9 rounded-full glass border border-white/20 text-xs text-foreground placeholder:text-[var(--text-3)] outline-none focus:border-[var(--orchid)]/60 font-[var(--font-grotesk)] transition-colors shadow-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-foreground p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Pills Glass Container */}
              <div className="p-1.5 rounded-full glass border border-white/20 shadow-md flex items-center justify-center gap-1 flex-wrap max-w-3xl">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "relative px-4 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)] cursor-pointer",
                    selectedCategory === "all"
                      ? "bg-foreground text-background shadow-sm font-semibold"
                      : "text-[var(--text-2)] hover:text-foreground hover:bg-white/10"
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
                        "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)] cursor-pointer",
                        active
                          ? "bg-foreground text-background shadow-sm font-semibold"
                          : "text-[var(--text-2)] hover:text-foreground hover:bg-white/10"
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
                      "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all font-[var(--font-grotesk)] cursor-pointer",
                      selectedCategory === "favorites"
                        ? "bg-[var(--orchid)] text-white shadow-sm font-semibold"
                        : "text-[var(--text-2)] hover:text-foreground hover:bg-white/10"
                    )}
                  >
                    <Heart className="w-3 h-3" fill={selectedCategory === "favorites" ? "currentColor" : "none"} />
                    <span>Favorites ({stories.filter((s) => favoriteIds.includes(s.id)).length})</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Stories Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 glass-card rounded-[32px] max-w-md mx-auto p-8 border border-white/20 shadow-xl"
            >
              <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-[var(--font-instrument-serif)] text-foreground">
                No stories found
              </h3>
              <p className="text-xs text-[var(--text-3)] mt-2 font-[var(--font-source-serif)]">
                Try clearing your search or filter to view the complete journal.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all")
                  setSearchQuery("")
                }}
                className="mt-6 px-5 py-2.5 rounded-full border border-white/20 text-xs text-foreground hover:bg-white/10 font-[var(--font-grotesk)] cursor-pointer transition-colors"
              >
                Reset filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7"
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
