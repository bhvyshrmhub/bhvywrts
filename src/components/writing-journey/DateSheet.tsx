"use client"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, ArrowRight } from "lucide-react"
import { parseStoryTags, MOOD_COLORS } from "@/lib/constants"
import type { Story } from "@/types"

interface DateSheetProps {
  date: string | null
  stories: Story[]
  onClose: () => void
}

function parseDateKey(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export default function DateSheet({ date, stories, onClose }: DateSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (date) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
        document.body.style.overflow = ""
      }
    }
  }, [date, handleKeyDown])

  if (!date) return null

  const d = parseDateKey(date)
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <AnimatePresence>
      {date && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[var(--surface)] border-t border-[var(--border)] md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:rounded-3xl md:border"
            role="dialog"
            aria-modal="true"
            aria-label={`Stories from ${dateStr}`}
          >
            {/* Drag handle (mobile) */}
            <div className="md:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-4 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-[var(--font-grotesk)] mb-1">
                  {dateStr}
                </p>
                {stories.length > 0 ? (
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    {stories.length} {stories.length === 1 ? "story" : "stories"}
                  </p>
                ) : null}
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 pb-8">
              {stories.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic">
                    Nothing was written here.
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    And that&apos;s okay.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stories.map((story) => (
                    <DateSheetStory key={story.id} story={story} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DateSheetStory({ story }: { story: Story }) {
  const tags = parseStoryTags(story.tags)
  const d = new Date(story.createdAt)
  const hasTime = !isNaN(d.getTime())

  const timeStr = hasTime
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : ""

  const accentColor = tags.accent || (tags.mood ? MOOD_COLORS[tags.mood] : undefined)

  return (
    <a
      href={`/stories/${story.slug}`}
      className="block rounded-2xl border border-[var(--border)] bg-secondary/30 p-4 hover:bg-secondary/60 transition-all duration-200 group"
    >
      <div className="flex gap-4">
        {story.coverImage ? (
          <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[var(--card)]">
            <img
              src={story.coverImage}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-20 h-20 rounded-xl flex items-center justify-center"
            style={{
              background: accentColor
                ? `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`
                : "linear-gradient(135deg, var(--card), var(--surface))",
            }}
          >
            <span
              className="font-[var(--font-instrument-serif)] text-lg opacity-30"
              style={{ color: accentColor || "var(--foreground)" }}
            >
              {story.title.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-[var(--font-instrument-serif)] text-base text-foreground leading-snug group-hover:opacity-90 transition-opacity truncate">
            {story.title}
          </h4>

          <div className="flex items-center gap-2 mt-1">
            {story.readingTime > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                <Clock className="w-3 h-3" />
                {story.readingTime} min read
              </span>
            )}
            {timeStr && (
              <span className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                {timeStr}
              </span>
            )}
            {story.published === false && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-500 font-medium font-[var(--font-grotesk)]">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            {tags.collection && (
              <span
                className="text-[10px] uppercase tracking-[0.12em] px-1.5 py-0.5 rounded border font-[var(--font-grotesk)]"
                style={{
                  borderColor: accentColor ? `${accentColor}30` : "var(--border)",
                  color: accentColor || "var(--foreground-secondary)",
                }}
              >
                {tags.collection}
              </span>
            )}
            {tags.mood && (
              <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">
                {tags.mood}
              </span>
            )}
          </div>

          {story.excerpt && (
            <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2 mt-2 leading-relaxed">
              {story.excerpt}
            </p>
          )}

          <div className="flex items-center gap-1 mt-2.5 text-[11px] text-[var(--orchid)] font-[var(--font-grotesk)] opacity-0 group-hover:opacity-100 transition-opacity">
            Read story
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  )
}
