"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { BookOpen } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import type { Story } from "@/types"

function SkeletonCard() {
  return <div className="h-72 rounded-[28px] skeleton border border-[var(--border)]" />
}

export default function StoriesPage() {
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  // Preserve old shared links like /stories?collection=...
  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const collection = params.get("collection")
    if (collection) {
      router.replace(`/collections/${encodeURIComponent(collection.toLowerCase())}`, { scroll: false })
    }
  }, [router])

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

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-28 md:pt-36">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted)] font-[var(--font-grotesk)] mb-4">
              The Archive
            </p>
            <h1 className="text-4xl md:text-6xl text-foreground">Stories</h1>
            <p className="text-sm md:text-base text-[var(--foreground-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
              Every page of this journal, waiting to be read.
            </p>
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
              <BookOpen className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                Nothing has been written here yet.
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1.5">
                The first page is still waiting for its first line.
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
