"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { BookOpen, Sparkles } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { CATEGORIES } from "@/lib/constants"
import type { Story } from "@/types"

function SkeletonCard() {
  return (
    <div className="h-72 rounded-xl skeleton border border-border/50" />
  )
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")

  const fetchStories = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("published", "true")
    if (category && category !== "all") params.set("category", category)
    if (sort) params.set("sort", sort)
    try {
      const res = await fetch(`/api/stories?${params}`)
      const data = await res.json()
      setStories(data)
    } catch {}
    setLoading(false)
  }, [category, sort])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-12 md:pt-16">


        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-[var(--font-serif)] text-foreground">Stories</h1>
              <p className="text-sm text-muted-foreground mt-2">Browse the collection</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setCategory("all")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  category === "all"
                    ? "glass text-foreground"
                    : "text-muted-foreground hover:text-foreground bg-secondary"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    category === cat
                      ? "glass text-foreground"
                      : "text-muted-foreground hover:text-foreground bg-secondary"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground border border-border outline-none appearance-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">Title</option>
              </select>
            </div>
          </motion.div>

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
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground/60">No stories found</h3>
              <p className="text-sm text-muted-foreground/40 mt-1">Try a different category.</p>
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