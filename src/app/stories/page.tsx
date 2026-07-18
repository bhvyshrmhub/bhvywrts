"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { BookOpen, TrendingUp, Clock, Bookmark, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { SearchBar } from "@/components/SearchBar"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { CATEGORIES } from "@/lib/constants"
import Link from "next/link"
import type { Story } from "@/types"

function SkeletonCard() {
  return (
    <div className="h-72 rounded-lg skeleton border border-border" />
  )
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([])

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

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("bhavy-bookmarks") || "[]")
      setBookmarkedIds(stored)
    } catch {}
  }, [])

  const bookmarkedStories = stories.filter(s => bookmarkedIds.includes(s.id))

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="relative pt-14 md:pt-16 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-[var(--font-serif)] text-foreground">Library</h1>
                <p className="text-sm text-muted-foreground mt-1">Browse the complete collection</p>
              </div>
              <div className="flex items-center gap-2">
                <SearchBar />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-lg border border-border outline-none appearance-none cursor-pointer hover:bg-border transition-colors"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              <button
                onClick={() => setCategory("all")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  category === "all"
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-border"
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
                      ? "bg-foreground text-background"
                      : "bg-secondary text-secondary-foreground hover:bg-border"
                  }`}
                >
                  {cat}
                </button>
              ))}
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
              <p className="text-sm text-muted-foreground/40 mt-1">
                Try a different category or check back later.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}