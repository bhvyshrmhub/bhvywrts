"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BookOpen, Search, X } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { CATEGORIES, MOODS, MOOD_COLORS, COLLECTIONS, type Mood } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function SkeletonCard() {
  return <div className="h-80 rounded-[28px] skeleton border border-white/[0.05]" />
}

function readInitialParams() {
  if (typeof window === "undefined") return { mood: "", collection: "", q: "" }
  const params = new URLSearchParams(window.location.search)
  return {
    mood: params.get("mood") || "",
    collection: params.get("collection") || "",
    q: params.get("q") || "",
  }
}

export default function StoriesPage() {
  const router = useRouter()
  const initial = readInitialParams()

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")
  const [mood, setMood] = useState(initial.mood)
  const [collection, setCollection] = useState(initial.collection)
  const [query, setQuery] = useState(initial.q)

  const fetchStories = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("published", "true")
    if (category && category !== "all") params.set("category", category)
    if (sort) params.set("sort", sort)
    if (query.trim()) params.set("search", query.trim())
    try {
      const res = await fetch(`/api/stories?${params}`)
      const data = await res.json()
      let list = Array.isArray(data) ? data : []
      if (mood) {
        list = list.filter((s) => {
          const tags = (s.tags || "").toLowerCase()
          return tags.includes(`mood:${mood.toLowerCase()}`)
        })
      }
      if (collection) {
        list = list.filter((s) => {
          const tags = (s.tags || "").toLowerCase()
          return tags.includes(`collection:${collection.toLowerCase()}`)
        })
      }
      setStories(list)
    } catch {}
    setLoading(false)
  }, [category, sort, mood, collection, query])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  const updateParams = useCallback(
    (updates: { mood?: string; collection?: string; q?: string }) => {
      const params = new URLSearchParams()
      if (updates.mood) params.set("mood", updates.mood)
      if (updates.collection) params.set("collection", updates.collection)
      if (updates.q) params.set("q", updates.q)
      if (category && category !== "all") params.set("category", category)
      const qs = params.toString()
      router.replace(qs ? `/stories?${qs}` : "/stories", { scroll: false })
    },
    [router, category]
  )

  const setMoodFilter = (m: string) => {
    setMood(m)
    updateParams({ mood: m || "", collection, q: query })
  }
  const setCollectionFilter = (c: string) => {
    setCollection(c)
    updateParams({ mood, collection: c || "", q: query })
  }

  const activeFilters = useMemo(() => {
    const f: string[] = []
    if (mood) f.push(`Mood: ${mood}`)
    if (collection) f.push(collection)
    if (query) f.push(`"${query}"`)
    return f
  }, [mood, collection, query])

  const clearAll = () => {
    setMood("")
    setCollection("")
    setQuery("")
    setCategory("all")
    setSort("newest")
    router.replace("/stories", { scroll: false })
  }

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-28 md:pt-36">
        <div className="max-w-6xl mx-auto px-5 md:px-6 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)] font-[var(--font-grotesk)] mb-4">
              The Archive
            </p>
            <h1 className="text-4xl md:text-6xl text-foreground">Stories</h1>
            <p className="text-sm md:text-base text-[var(--foreground-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
              Every page of this journal, waiting to be read.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-xl mx-auto mb-10"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  updateParams({ mood, collection, q: e.target.value })
                }}
                placeholder="Search the journal..."
                aria-label="Search stories"
                className="w-full pl-11 pr-10 py-3.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-sm text-foreground placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--orchid)]/40 transition-colors"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("")
                    updateParams({ mood, collection, q: "" })
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Category filter */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
          >
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {CATEGORIES.map((cat) => (
              <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat}
              </FilterChip>
            ))}
          </motion.div>

          {/* Mood + Collection filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-[var(--font-grotesk)] mr-1">
              Mood
            </span>
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMoodFilter(mood === m ? "" : m.toLowerCase())}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs border transition-colors font-[var(--font-grotesk)]",
                  mood === m.toLowerCase()
                    ? "mood-chip"
                    : "border-white/[0.06] text-[var(--foreground-secondary)] hover:border-white/20 hover:text-foreground"
                )}
                style={mood === m.toLowerCase() ? { color: MOOD_COLORS[m as Mood] } : undefined}
              >
                {m}
              </button>
            ))}

            <span className="hidden md:inline text-[var(--muted)] mx-2">·</span>

            <select
              value={collection}
              onChange={(e) => setCollectionFilter(e.target.value)}
              aria-label="Filter by collection"
              className="px-3 py-1.5 rounded-full text-xs bg-white/[0.03] border border-white/[0.07] text-[var(--foreground-secondary)] outline-none cursor-pointer appearance-none font-[var(--font-grotesk)]"
            >
              <option value="">All Collections</option>
              {COLLECTIONS.map((c) => (
                <option key={c} value={c.toLowerCase()}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort stories"
              className="px-3 py-1.5 rounded-full text-xs bg-white/[0.03] border border-white/[0.07] text-[var(--foreground-secondary)] outline-none cursor-pointer appearance-none font-[var(--font-grotesk)]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title">Title</option>
            </select>
          </motion.div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.08] text-[var(--foreground-secondary)] font-[var(--font-grotesk)]"
                >
                  {f}
                </span>
              ))}
              <button
                onClick={clearAll}
                className="text-[11px] text-[var(--muted)] hover:text-foreground transition-colors underline-animate"
              >
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                No stories found
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1.5">
                Try a different category, mood, or search.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {stories.map((story, i) => (
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs border transition-colors font-[var(--font-grotesk)]",
        active
          ? "border-transparent bg-white text-black"
          : "border-white/[0.06] text-[var(--foreground-secondary)] hover:border-white/20 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
