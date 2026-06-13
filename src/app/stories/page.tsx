"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { BookOpen, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ParticleBackground } from "@/components/ParticleBackground"
import { StoryCard } from "@/components/StoryCard"
import { SearchBar } from "@/components/SearchBar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/lib/constants"
import type { Story } from "@/types"

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

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Story Library
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Browse through a collection of stories, thoughts, and reflections.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex-1">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <div className="flex gap-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px] rounded-full border-border/50 bg-card/50">
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
                  <SelectTrigger className="w-[140px] rounded-full border-border/50 bg-card/50">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl bg-card/30 border border-border/30 animate-pulse"
                  />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-medium text-muted-foreground">No stories found</h3>
                <p className="text-sm text-muted-foreground/60">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
