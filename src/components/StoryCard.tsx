"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, Bookmark, Share2, Heart, Star, ArrowUpRight } from "lucide-react"
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
  const borderGlow = accent || moodColor || "var(--orchid)"

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
      <Link
        href={`/stories/${story.slug}`}
        className="group relative block h-full focus-visible:outline-none"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] h-full flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:-translate-y-1 group-hover:border-white/30 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.45)]",
            large ? "aspect-[16/10] min-h-[380px]" : "aspect-[4/5] min-h-[420px]"
          )}
        >
          {/* Background Cover Image */}
          <div className="absolute inset-0 bg-[#09090c] overflow-hidden">
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
                    "w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  style={
                    coverPos ? { objectPosition: `${coverPos.x}% ${coverPos.y}%` } : undefined
                  }
                />
              </>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(145deg, color-mix(in srgb, ${borderGlow} 30%, #07060b) 0%, #07060b 80%)`,
                }}
              />
            )}

            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />
          </div>

          {/* Top Overlaid Controls Row */}
          <div className="relative z-10 flex items-center justify-between p-4.5">
            {/* Top-Left: Editor's Pick / Mood Chip */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {editorsPick && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-[0.16em] backdrop-blur-md border border-white/25 bg-black/40 text-white font-[var(--font-grotesk)] shadow-sm">
                  <Star className="w-2.5 h-2.5 text-[var(--orchid)]" fill="currentColor" />
                  <span>Editor&apos;s Pick</span>
                </span>
              )}
              {mood && !editorsPick && (
                <span
                  className="px-2.5 py-1 rounded-full text-[9px] font-medium uppercase tracking-[0.16em] backdrop-blur-md border border-white/20 text-white/90 font-[var(--font-grotesk)] shadow-sm"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    borderColor: moodColor ? `${moodColor}40` : "rgba(255,255,255,0.2)",
                  }}
                >
                  {mood}
                </span>
              )}
            </div>

            {/* Top-Right: Circular Glass Arrow Button (Rotates 45deg on hover) */}
            <div
              className="w-9 h-9 rounded-full border border-white/25 bg-black/35 backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 group-hover:bg-white/25 group-hover:border-white/40 shadow-sm"
              aria-hidden="true"
            >
              <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          {/* Bottom: Overlaid Glass Info Capsule */}
          <div className="relative z-10 p-3 sm:p-4 mt-auto">
            <div className="glass-strong rounded-[22px] p-4 sm:p-5 border border-white/20 shadow-lg backdrop-blur-xl transition-all duration-300 group-hover:bg-white/15 dark:group-hover:bg-white/10">
              {/* Meta strip */}
              <div className="flex items-center justify-between text-[10px] text-white/75 font-[var(--font-grotesk)] mb-2">
                <div className="flex items-center gap-2">
                  {story.category && (
                    <span className="uppercase tracking-[0.2em] font-medium text-[var(--orchid)]">
                      {story.category}
                    </span>
                  )}
                  {story.category && <span className="w-1 h-1 rounded-full bg-white/40" />}
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {readingTime} min
                  </span>
                </div>
                <span>
                  {new Date(story.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Title */}
              <h3
                className={cn(
                  "font-[var(--font-instrument-serif)] text-white leading-[1.18] transition-colors drop-shadow-sm",
                  large ? "text-2xl sm:text-3xl" : "text-xl sm:text-[22px]"
                )}
              >
                {story.title}
              </h3>

              {/* Excerpt clamp (2 lines) */}
              {story.excerpt && (
                <p className="text-xs sm:text-[13px] text-white/80 mt-1.5 leading-relaxed line-clamp-2 font-[var(--font-source-serif)]">
                  {story.excerpt}
                </p>
              )}

              {/* Bottom Quick Actions (Bookmark, Favorite, Share) */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/15">
                <span className="text-[11px] font-medium text-white/90 group-hover:text-[var(--orchid)] transition-colors font-[var(--font-grotesk)] inline-flex items-center gap-1">
                  <span>Read story</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={bookmarks.toggle}
                    aria-label={bookmarks.isIn ? "Remove bookmark" : "Bookmark story"}
                    aria-pressed={bookmarks.isIn}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                      bookmarks.isIn
                        ? "text-[var(--orchid)] bg-white/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Bookmark className="w-3 h-3" fill={bookmarks.isIn ? "currentColor" : "none"} />
                  </button>

                  <button
                    type="button"
                    onClick={favorites.toggle}
                    aria-label={favorites.isIn ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={favorites.isIn}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                      favorites.isIn
                        ? "text-[var(--orchid)] bg-white/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Heart className="w-3 h-3" fill={favorites.isIn ? "currentColor" : "none"} />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    aria-label="Share story"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
