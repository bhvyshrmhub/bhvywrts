"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"
import { parseStoryTags, MOOD_COLORS } from "@/lib/constants"
import type { Story } from "@/types"

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

interface TimelineViewProps {
  groupedByMonth: [string, Story[]][]
  selectedYear: number
  yearStoryCount: number
}

function getMonthLabel(monthKey: string) {
  const [y, m] = monthKey.split("-")
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
}

function getWritingMoment(story: Story): string | null {
  const d = new Date(story.createdAt)
  if (isNaN(d.getTime())) return null
  const hour = d.getHours()
  if (hour >= 0 && hour < 5) return "Written in the quiet of night"
  if (hour >= 5 && hour < 8) return "An early morning story"
  if (hour >= 21 || hour < 0) return "A late-night story"
  return null
}

export default function TimelineView({ groupedByMonth, selectedYear, yearStoryCount }: TimelineViewProps) {
  if (groupedByMonth.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-[var(--muted)]">
          No stories yet in {selectedYear}.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-14">
      {/* Year summary */}
      <div className="text-center">
        <h2 className="font-[var(--font-instrument-serif)] text-5xl md:text-6xl text-foreground/10 select-none">
          {selectedYear}
        </h2>
        <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)] mt-1">
          {yearStoryCount} {yearStoryCount === 1 ? "story" : "stories"} written
        </p>
      </div>

      {/* Months */}
      {groupedByMonth.map(([monthKey, monthStories], mi) => (
        <div key={monthKey}>
          {/* Month header */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] font-[var(--font-grotesk)]">
                {getMonthLabel(monthKey)}
              </h3>
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">
                {monthStories.length} {monthStories.length === 1 ? "story" : "stories"}
              </span>
            </div>
          </motion.div>

          {/* Timeline entries */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-0 bottom-0 w-px bg-[var(--border)]" />

            <div className="space-y-0">
              {monthStories.map((story, si) => (
                <TimelineEntry
                  key={story.id}
                  story={story}
                  index={si}
                  isLast={si === monthStories.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineEntry({ story, index, isLast }: { story: Story; index: number; isLast: boolean }) {
  const tags = parseStoryTags(story.tags)
  const d = new Date(story.createdAt)
  const hasTime = !isNaN(d.getTime())

  const dateStr = hasTime
    ? d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : ""

  const timeStr = hasTime
    ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : ""

  const fullDateStr = hasTime
    ? d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
    : ""

  const accentColor = tags.accent || (tags.mood ? MOOD_COLORS[tags.mood] : undefined)
  const moment = getWritingMoment(story)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-4 md:gap-6 group pb-8"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center flex-shrink-0 pt-1">
        <div
          className="w-[11px] h-[11px] rounded-full border-2 border-[var(--background)] transition-all duration-300 group-hover:scale-125 z-10"
          style={{
            backgroundColor: accentColor || "var(--orchid)",
            boxShadow: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 8px ${accentColor || "var(--orchid)"}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
          }}
        />
        {!isLast && <div className="w-px flex-1 bg-[var(--border)]" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Date */}
        <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)] mb-2">
          {dateStr}
          {timeStr && (
            <span className="ml-2 text-[var(--foreground-secondary)]">
              {timeStr}
            </span>
          )}
          {story.published === false && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-500 font-medium">
              Draft
            </span>
          )}
        </p>

        {/* Story card */}
        <a
          href={`/stories/${story.slug}`}
          className="block -mx-2 px-2 py-3 rounded-xl hover:bg-secondary/50 transition-all duration-300 group/card"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Cover */}
            {story.coverImage ? (
              <div className="flex-shrink-0 w-full sm:w-40 h-48 sm:h-[140px] rounded-xl overflow-hidden bg-[var(--card)]">
                <img
                  src={story.coverImage}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
                />
              </div>
            ) : (
              <div
                className="flex-shrink-0 w-full sm:w-40 h-48 sm:h-[140px] rounded-xl flex items-center justify-center"
                style={{
                  background: accentColor
                    ? `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`
                    : "linear-gradient(135deg, var(--card), var(--surface))",
                }}
              >
                <span
                  className="font-[var(--font-instrument-serif)] text-2xl opacity-30"
                  style={{ color: accentColor || "var(--foreground)" }}
                >
                  {story.title.charAt(0)}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="font-[var(--font-instrument-serif)] text-lg md:text-xl text-foreground leading-snug group-hover/card:opacity-90 transition-opacity duration-300">
                {story.title}
              </h4>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 mb-2">
                {story.readingTime > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                    <Clock className="w-3 h-3" />
                    {story.readingTime} min read
                  </span>
                )}
                {hasTime && (
                  <span className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                    {fullDateStr}
                  </span>
                )}
              </div>

              {story.excerpt && (
                <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 leading-relaxed">
                  {story.excerpt}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2.5">
                {tags.collection && (
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border font-[var(--font-grotesk)]"
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

              {moment && (
                <p className="text-[11px] text-[var(--muted)] italic mt-2 font-[var(--font-source-serif)]">
                  {moment}
                </p>
              )}
            </div>
          </div>
        </a>
      </div>
    </motion.div>
  )
}
