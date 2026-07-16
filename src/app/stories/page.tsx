"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { BookOpen, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ParticleBackground } from "@/components/ParticleBackground"
import { StoryCard } from "@/components/StoryCard"
import { SearchBar } from "@/components/SearchBar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CATEGORIES } from "@/lib/constants"
import type { Story } from "@/types"

function SkeletonCard() {
  return (
    <div className="h-72 rounded-2xl glass overflow-hidden skeleton" />
  )
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("newest")

  const fetchStories = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("published", "true")
    if (category && category !== "all") params.set("category", category)
    if (search) params.set("search", search)
    if (sort) params.set("sort", sort)
    try {
      const res = await fetch(`/api/stories?${params}`)
      const data = await res.json()
      setStories(data)
    } catch {}
    setLoading(false)
  }, [category, search, sort])

  useEffect(() => {
    const timer = setTimeout(fetchStories, 300)
    return () => clearTimeout(timer)
  }, [fetchStories])

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 sm:space-y-10"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-primary/70 border border-primary/20"
              >
                <Sparkles className="w-3 h-3" />
                Browse the collection
              </motion.div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-text bg-gradient-to-r from-primary via-accent to-secondary">
                  Story Library
                </span>
              </h1>
              <p className="text-muted-foreground/50 text-base sm:text-lg max-w-xl mx-auto">
                Browse through a collection of stories, thoughts, and reflections.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-3xl mx-auto">
              <div className="flex-1">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className="flex gap-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px] rounded-2xl glass border-white/10 h-12">
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[140px] rounded-2xl glass border-white/10 h-12">
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-24 space-y-4"
              >
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <h3 className="text-xl font-medium text-muted-foreground/60">No stories found</h3>
                <p className="text-sm text-muted-foreground/40">
                  Try adjusting your search or filter criteria.
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              >
                {stories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}