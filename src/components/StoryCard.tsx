"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Bookmark, Share2, Heart, Star } from "lucide-react"
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

  const readingTime = story.readingTime || (story.content ? Math.max(1, Math.ceil(story.content.split(/\s+/).length / 200)) : 5)

  const { mood, accent, editorsPick, coverPos } = useMemo(() => parseStoryTags(story.tags || ""), [story.tags])
  const moodColor = mood ? MOOD_COLORS[mood] : undefined
  const borderGlow = accent || moodColor || "rgba(177, 108, 234, 0.18)"

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/stories/${story.slug}`} className="group block h-full focus-visible:outline-none">
        <div
          className="glass-card overflow-hidden h-full hover-lift"
          style={{
            borderRadius: large ? 36 : 28,
            boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Cover — dominates the card */}
          <div className="relative overflow-hidden bg-[#0a0a0c]">
            <div className={cn("relative", large ? "aspect-[16/9]" : "aspect-[4/3]")}>
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
                      "w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]",
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
                    background: `linear-gradient(140deg, color-mix(in srgb, ${borderGlow} 22%, #0a0a0c) 0%, #0a0a0c 70%)`,
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full" style={{ boxShadow: `0 0 60px ${borderGlow}55, 0 0 120px ${borderGlow}30` }} />
                </div>
              )}

              {/* Bottom gradient — glassy, not heavy */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

              {/* Mood — top right */}
              {mood && (
                <span
                  className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-[0.14em] backdrop-blur-md border font-[var(--font-grotesk)]"
                  style={{
                    color: moodColor,
                    borderColor: colorBrightness(moodColor, 0.35),
                    background: `${moodColor}14`,
                  }}
                >
                  {mood}
                </span>
              )}

              {/* Editor's Pick badge */}
              {editorsPick && (
                <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-[0.14em] backdrop-blur-md border border-white/10 bg-black/30 text-white font-[var(--font-grotesk)]">
                  <Star className="w-2.5 h-2.5" fill="currentColor" />
                  Editor&apos;s Pick
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5">
            {/* Meta row */}
            <div className="flex items-center gap-2.5 mb-2.5">
              {story.category && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--foreground-secondary)] font-[var(--font-grotesk)]">
                  {story.category}
                </span>
              )}
              <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)]" />
              <span className="text-[11px] text-[var(--muted)] flex items-center gap-1 font-[var(--font-grotesk)]">
                <Clock className="w-3 h-3" />
                {readingTime} min
              </span>
              <span className="ml-auto text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                {new Date(story.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <h3
              className={cn(
                "font-[var(--font-instrument-serif)] text-foreground leading-[1.25] group-hover:opacity-90 transition-opacity duration-300",
                large ? "text-2xl md:text-3xl" : "text-xl md:text-[22px]"
              )}
            >
              {story.title}
            </h3>

            {story.excerpt && (
              <p className={cn("text-sm text-[var(--foreground-secondary)] mt-2 leading-relaxed line-clamp-2", large && "text-[15px]")}>
                {story.excerpt}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-[var(--border)]">
              <button
                onClick={bookmarks.toggle}
                aria-label={bookmarks.isIn ? "Remove bookmark" : "Bookmark story"}
                aria-pressed={bookmarks.isIn}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  bookmarks.isIn
                    ? "text-[var(--lavender)] bg-secondary"
                    : "text-[var(--muted)] hover:text-foreground hover:bg-secondary"
                )}
              >
                <Bookmark className="w-[17px] h-[17px]" fill={bookmarks.isIn ? "currentColor" : "none"} />
              </button>
              <button
                onClick={favorites.toggle}
                aria-label={favorites.isIn ? "Remove from favorites" : "Add to favorites"}
                aria-pressed={favorites.isIn}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  favorites.isIn
                    ? "text-[var(--orchid)] bg-secondary"
                    : "text-[var(--muted)] hover:text-foreground hover:bg-secondary"
                )}
              >
                <Heart className="w-[17px] h-[17px]" fill={favorites.isIn ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                aria-label="Share story"
                className="p-2 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-all duration-300"
              >
                <Share2 className="w-[17px] h-[17px]" />
              </button>
              <span className="ml-auto text-[11px] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-[var(--font-grotesk)]">
                Read →
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
