"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Bookmark, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseStoryTags, MOOD_COLORS } from "@/lib/constants"

interface StoryCardProps {
  story: {
    id: string
    slug: string
    title: string
    excerpt: string | null
    coverImage: string | null
    category: string | null
    tags?: string | null
    createdAt: string
    author?: string | null
    readingTime?: string | number | null
    content?: string | null
  }
  index?: number
}

export function StoryCard({ story, index = 0 }: StoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const readingTime = story.readingTime || (
    story.content
      ? Math.max(1, Math.ceil(story.content.split(/\s+/).length / 200)) + " min read"
      : "5 min read"
  )

  const { mood, accent } = useMemo(() => parseStoryTags(story.tags || ""), [story.tags])
  const moodColor = mood ? MOOD_COLORS[mood] : undefined

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setBookmarked(!bookmarked)
    try {
      const stored = JSON.parse(localStorage.getItem("bhavy-bookmarks") || "[]")
      if (!bookmarked) {
        localStorage.setItem("bhavy-bookmarks", JSON.stringify([...stored, story.id]))
      } else {
        localStorage.setItem("bhavy-bookmarks", JSON.stringify(stored.filter((id: string) => id !== story.id)))
      }
    } catch {}
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({ title: story.title, url: `/stories/${story.slug}` }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/stories/${story.slug}`)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/stories/${story.slug}`} className="group block">
        <div
          className="glass-card rounded-xl overflow-hidden hover-lift"
          style={moodColor ? { borderColor: moodColor } : undefined}
        >
          {/* Cover Image */}
          <div className="aspect-[16/9] relative overflow-hidden bg-secondary">
            {story.coverImage ? (
              <>
                {!imageLoaded && <div className="absolute inset-0 skeleton" />}
                <img
                  src={story.coverImage}
                  alt={story.title}
                  onLoad={() => setImageLoaded(true)}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/20 mx-auto mb-2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {story.category && (
              <span
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium glass backdrop-blur-md text-foreground/80"
                style={moodColor ? { borderColor: moodColor } : undefined}
              >
                {story.category}
              </span>
            )}

            {mood && (
              <span
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider glass"
                style={{
                  color: moodColor,
                  borderColor: moodColor ? `${moodColor}40` : undefined,
                  background: moodColor ? `${moodColor}15` : undefined,
                }}
              >
                {mood}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime}
              </span>
            </div>

            <h3
              className="text-lg font-[var(--font-serif)] text-foreground leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-2"
              style={moodColor ? { color: `var(--foreground)` } : undefined}
            >
              {story.title}
            </h3>

            {story.excerpt && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {new Date(story.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleBookmark}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    bookmarked ? "text-accent" : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
