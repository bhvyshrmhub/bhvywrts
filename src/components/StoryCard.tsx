"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Bookmark, Share2, Heart, Star, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { parseStoryTags, MOOD_COLORS } from "@/lib/constants"

interface StoryCardProps {
  story: {
    id: string
    slug: string
    title: string
    excerpt?: string | null
    coverImage?: string | null
    category?: string | null
    tags?: string | null
    createdAt: string
    readingTime?: number | null
    content?: string | null
  }
  index?: number
  large?: boolean
}

function useLocalList(key: string, id: string) {
  const [items, setItems] = useState<string[]>([])
  const isIn = items.includes(id)

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const next = isIn ? items.filter((s) => s !== id) : [...items, id]
      setItems(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {}
    },
    [items, id, key, isIn]
  )

  return { isIn, toggle }
}

export function StoryCard({ story, index = 0, large = false }: StoryCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const bookmarks = useLocalList("bhavy-bookmarks", story.id)
  const favorites = useLocalList("bhavy-favorites", story.id)

  const readingTime =
    story.readingTime ||
    (story.content ? Math.max(1, Math.ceil(story.content.split(/\s+/).length / 200)) : 5)

  const { mood, accent, editorsPick, coverPos } = useMemo(
    () => parseStoryTags(story.tags || ""),
    [story.tags]
  )
  const moodColor = mood ? MOOD_COLORS[mood] : undefined
  const borderGlow = accent || moodColor || "rgba(232, 121, 249, 0.2)"

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/stories/${story.slug}`
    if (navigator.share) {
      navigator.share({ title: story.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/stories/${story.slug}`} className="group block h-full focus-visible:outline-none">
        <div
          className={cn(
            "glass-card overflow-hidden h-full flex flex-col justify-between hover-lift transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            large ? "rounded-[24px] md:rounded-[28px]" : "rounded-[20px] md:rounded-[24px]",
            "border border-[var(--border)] group-hover:border-[var(--border-strong)]"
          )}
        >
          <div>
            {/* Cover Image Container */}
            <div className="relative overflow-hidden bg-[#09090c]">
              <div className={cn("relative w-full", large ? "aspect-[16/9]" : "aspect-[16/10]")}>
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
                        "w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                        imageLoaded ? "opacity-100" : "opacity-0"
                      )}
                      style={
                        coverPos
                          ? { objectPosition: `${coverPos.x}% ${coverPos.y}%` }
                          : undefined
                      }
                    />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(140deg, color-mix(in srgb, ${borderGlow} 24%, #09090c) 0%, #09090c 70%)`,
                    }}
                  >
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                      style={{ boxShadow: `0 0 50px ${borderGlow}55, 0 0 100px ${borderGlow}30` }}
                    />
                  </div>
                )}

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Mood badge — top right */}
                {mood && (
                  <span
                    className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-[0.16em] backdrop-blur-md border font-[var(--font-grotesk)]"
                    style={{
                      color: moodColor,
                      borderColor: colorBrightness(moodColor, 0.4),
                      background: `${moodColor}18`,
                    }}
                  >
                    {mood}
                  </span>
                )}

                {/* Editor's Pick badge — top left */}
                {editorsPick && (
                  <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-[0.16em] backdrop-blur-md border border-white/15 bg-black/40 text-white font-[var(--font-grotesk)]">
                    <Star className="w-2.5 h-2.5 text-[var(--orchid)]" fill="currentColor" />
                    Editor&apos;s Pick
                  </span>
                )}
              </div>
            </div>

            {/* Editorial Content */}
            <div className="p-5 md:p-6">
              {/* Meta row */}
              <div className="flex items-center gap-2 mb-2.5">
                {story.category && (
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--orchid)] font-medium font-[var(--font-grotesk)]">
                    {story.category}
                  </span>
                )}
                {story.category && <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)]" />}
                <span className="text-[10px] text-[var(--muted)] flex items-center gap-1 font-[var(--font-grotesk)]">
                  <Clock className="w-2.5 h-2.5" />
                  {readingTime} min
                </span>
                <span className="ml-auto text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">
                  {new Date(story.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "font-[var(--font-instrument-serif)] text-foreground leading-[1.18] transition-colors duration-200 group-hover:text-foreground",
                  large ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
                )}
              >
                {story.title}
              </h3>

              {/* Excerpt */}
              {story.excerpt && (
                <p
                  className={cn(
                    "text-xs md:text-sm text-[var(--foreground-secondary)] mt-2 leading-relaxed line-clamp-2 font-[var(--font-source-serif)]",
                    large && "text-sm"
                  )}
                >
                  {story.excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Card Footer / Actions */}
          <div className="px-5 pb-4 md:px-6 md:pb-5">
            <div className="flex items-center gap-1 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={bookmarks.toggle}
                aria-label={bookmarks.isIn ? "Remove bookmark" : "Bookmark story"}
                aria-pressed={bookmarks.isIn}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  bookmarks.isIn
                    ? "text-[var(--orchid)] bg-secondary"
                    : "text-[var(--muted)] hover:text-foreground hover:bg-secondary"
                )}
              >
                <Bookmark className="w-3.5 h-3.5" fill={bookmarks.isIn ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={favorites.toggle}
                aria-label={favorites.isIn ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={favorites.isIn}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  favorites.isIn
                    ? "text-[var(--orchid)] bg-secondary"
                    : "text-[var(--muted)] hover:text-foreground hover:bg-secondary"
                )}
              >
                <Heart className="w-3.5 h-3.5" fill={favorites.isIn ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share story"
                className="p-1.5 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-all duration-300"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              <span className="ml-auto text-[11px] font-medium text-[var(--muted)] group-hover:text-[var(--orchid)] transition-colors flex items-center gap-1 font-[var(--font-grotesk)]">
                <span>Read</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function colorBrightness(color: string | undefined, alpha: number): string {
  if (!color) return "rgba(255,255,255,0.2)"
  if (color.startsWith("#")) {
    const hex = color.slice(1)
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  return `rgba(255,255,255,${alpha})`
}
