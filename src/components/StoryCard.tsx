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
  const borderGlow = moodColor || "rgba(139, 92, 246, 0.15)"

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
          className="glass-card overflow-hidden hover-lift"
          style={{
            borderRadius: 32,
            boxShadow: `0 4px 24px ${borderGlow}15, 0 1px 3px rgba(0,0,0,0.2)`,
          }}
        >
          {/* Cover Image - dominates the card */}
          <div className="relative overflow-hidden" style={{ borderRadius: 0 }}>
            <div className="aspect-[4/3] md:aspect-[16/10] relative bg-secondary">
              {story.coverImage ? (
                <>
                  {!imageLoaded && <div className="absolute inset-0 skeleton" />}
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.05]",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 moon-glow" />
                </div>
              )}

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Category badge */}
              {story.category && (
                <span
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-medium glass backdrop-blur-md text-foreground/90"
                >
                  {story.category}
                </span>
              )}

              {mood && (
                <span
                  className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider glass"
                  style={{
                    color: moodColor,
                    borderColor: `${moodColor}40`,
                    background: `${moodColor}15`,
                  }}
                >
                  {mood}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readingTime}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-[var(--font-serif)] text-foreground leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-2">
              {story.title}
            </h3>

            {story.excerpt && (
              <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30">
              <span className="text-xs text-muted-foreground/50">
                {new Date(story.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleBookmark}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    bookmarked ? "text-accent" : "text-muted-foreground/40 hover:text-foreground"
                  )}
                  style={bookmarked && moodColor ? { color: moodColor } : undefined}
                >
                  <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
