"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Moon } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { parseStoryTags } from "@/lib/constants"
import type { Story } from "@/types"
import TimelineView from "./writing-journey/TimelineView"
import CalendarView from "./writing-journey/CalendarView"
import DateSheet from "./writing-journey/DateSheet"

type ViewMode = "timeline" | "calendar"

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function WritingJourney() {
  const { isAdmin, checking } = useAuthStore()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [view, setView] = useState<ViewMode>("timeline")
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSelectedMonth(new Date().getMonth())
    useAuthStore.getState().checkAuth()
  }, [])

  const fetchStories = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const isAdminUser = isAdmin && !checking
      const url = isAdminUser ? "/api/stories?published=all" : "/api/stories?published=true"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setStories(Array.isArray(data) ? data : [])
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [isAdmin, checking])

  useEffect(() => {
    if (!checking) fetchStories()
  }, [checking, fetchStories])

  const years = useMemo(() => {
    const yearSet = new Set<number>()
    for (const s of stories) {
      const d = new Date(s.createdAt)
      if (!isNaN(d.getTime())) yearSet.add(d.getFullYear())
    }
    return Array.from(yearSet).sort((a, b) => b - a)
  }, [stories])

  useEffect(() => {
    if (years.length > 0 && selectedYear === null) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  const filteredStories = useMemo(() => {
    if (selectedYear === null) return stories
    return stories.filter((s) => {
      const d = new Date(s.createdAt)
      return !isNaN(d.getTime()) && d.getFullYear() === selectedYear
    })
  }, [stories, selectedYear])

  const groupedByMonth = useMemo(() => {
    const map = new Map<string, Story[]>()
    for (const s of filteredStories) {
      const d = new Date(s.createdAt)
      if (isNaN(d.getTime())) continue
      const key = getMonthKey(d)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    for (const [, arr] of entries) {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return entries
  }, [filteredStories])

  const storiesByDate = useMemo(() => {
    const map = new Map<string, Story[]>()
    for (const s of stories) {
      const d = new Date(s.createdAt)
      if (isNaN(d.getTime())) continue
      const key = formatDateKey(d)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [stories])

  const onThisDay = useMemo(() => {
    if (!mounted || stories.length === 0) return null
    const now = new Date()
    const month = now.getMonth()
    const day = now.getDate()
    const currentYear = now.getFullYear()
    const matches: Story[] = []
    for (const s of stories) {
      const d = new Date(s.createdAt)
      if (isNaN(d.getTime())) continue
      if (d.getMonth() === month && d.getDate() === day && d.getFullYear() < currentYear) {
        matches.push(s)
      }
    }
    matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return matches.length > 0 ? matches[0] : null
  }, [stories, mounted])

  const writingRhythm = useMemo(() => {
    if (stories.length < 3) return null
    const dates = stories
      .map((s) => new Date(s.createdAt).getTime())
      .filter((t) => !isNaN(t))
      .sort((a, b) => a - b)
    if (dates.length < 3) return null
    let totalDays = 0
    for (let i = 1; i < dates.length; i++) {
      totalDays += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
    }
    const avgDays = totalDays / (dates.length - 1)
    if (avgDays <= 4) return "about 2 stories a week"
    if (avgDays <= 8) return "about 1 story a week"
    if (avgDays <= 16) return "about 2 stories a month"
    if (avgDays <= 35) return "about 1 story a month"
    return null
  }, [stories])

  const totalReadingTime = useMemo(() => {
    return filteredStories.reduce((sum, s) => sum + (s.readingTime || 0), 0)
  }, [filteredStories])

  const selectedDateStories = useMemo(() => {
    if (!selectedDate) return []
    return storiesByDate.get(selectedDate) || []
  }, [selectedDate, storiesByDate])

  const handlePrevYear = useCallback(() => {
    const idx = years.indexOf(selectedYear!)
    if (idx < years.length - 1) setSelectedYear(years[idx + 1])
  }, [years, selectedYear])

  const handleNextYear = useCallback(() => {
    const idx = years.indexOf(selectedYear!)
    if (idx > 0) setSelectedYear(years[idx - 1])
  }, [years, selectedYear])

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth((m) => (m === 0 ? 11 : m - 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setSelectedMonth((m) => (m === 11 ? 0 : m + 1))
  }, [])

  if (checking || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-32 md:pt-40">
          <div className="space-y-6">
            <div className="h-4 w-24 rounded-full skeleton" />
            <div className="h-10 w-80 rounded-xl skeleton" />
            <div className="h-4 w-64 rounded-full skeleton" />
            <div className="h-10 w-40 rounded-full skeleton mt-8" />
            <div className="space-y-12 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 rounded-full skeleton" />
                    <div className="w-px h-32 skeleton" />
                  </div>
                  <div className="flex-1 space-y-3 pb-8">
                    <div className="h-4 w-20 rounded-full skeleton" />
                    <div className="h-48 w-full rounded-2xl skeleton" />
                    <div className="h-6 w-48 rounded-lg skeleton" />
                    <div className="h-4 w-32 rounded-full skeleton" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl opacity-40">
            <Moon className="w-10 h-10 mx-auto text-[var(--muted)]" />
          </div>
          <p className="font-[var(--font-instrument-serif)] text-xl text-foreground">
            Something went quiet.
          </p>
          <p className="text-sm text-[var(--foreground-secondary)]">
            We couldn&apos;t load the writing journey right now.
          </p>
          <button
            onClick={fetchStories}
            className="text-sm text-[var(--orchid)] hover:underline transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-32 md:pt-40 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-[var(--font-grotesk)]">
            <Moon className="w-3 h-3" />
            Calendar
          </div>
          <h1 className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl text-foreground leading-tight">
            Your writing journey starts here.
          </h1>
          <p className="text-[var(--foreground-secondary)] max-w-md mx-auto leading-relaxed">
            Every story will eventually leave a little mark on this timeline.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-28 md:pt-36 pb-20">
        {/* Header */}
        <header className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[var(--muted)] font-[var(--font-grotesk)]">
              <Moon className="w-3 h-3" />
              Calendar
            </div>
            <h1 className="font-[var(--font-instrument-serif)] text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.15]">
              A timeline of the things I&apos;ve written.
            </h1>
            <p className="text-sm text-[var(--foreground-secondary)] max-w-md mx-auto leading-relaxed">
              Some weeks have a story.<br />
              Some weeks have silence.<br />
              Both belong here.
            </p>
            <div className="flex items-center justify-center gap-6 pt-2">
              <span className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
                {stories.length} {stories.length === 1 ? "story" : "stories"}
              </span>
              {years.length > 1 && (
                <span className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
                  {years[years.length - 1]} — {years[0]}
                </span>
              )}
              {totalReadingTime > 0 && (
                <span className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
                  {totalReadingTime} min of reading
                </span>
              )}
            </div>
          </motion.div>
        </header>

        {/* Writing Rhythm */}
        {writingRhythm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-secondary border border-[var(--border)]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-[var(--font-grotesk)]">
                Writing rhythm
              </span>
              <span className="w-px h-3 bg-[var(--border)]" />
              <span className="text-xs text-[var(--foreground-secondary)]">
                {writingRhythm}
              </span>
            </div>
          </motion.div>
        )}

        {/* On This Day */}
        {onThisDay && (
          <OnThisDayCard story={onThisDay} />
        )}

        {/* View Switcher + Year Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <ViewSwitcher view={view} onChange={setView} />

          <div className="flex items-center gap-2">
            {years.length > 1 && view === "timeline" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevYear}
                  disabled={years.indexOf(selectedYear!) >= years.length - 1}
                  className="p-1.5 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous year"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-foreground min-w-[3rem] text-center font-[var(--font-grotesk)]">
                  {selectedYear}
                </span>
                <button
                  onClick={handleNextYear}
                  disabled={years.indexOf(selectedYear!) <= 0}
                  className="p-1.5 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next year"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {view === "calendar" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-foreground min-w-[10rem] text-center font-[var(--font-grotesk)]">
                  {MONTH_NAMES[selectedMonth]} {selectedYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-full text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {view === "timeline" ? (
            <motion.div
              key={`timeline-${selectedYear}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <TimelineView
                groupedByMonth={groupedByMonth}
                selectedYear={selectedYear!}
                yearStoryCount={filteredStories.length}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`calendar-${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <CalendarView
                year={selectedYear!}
                month={selectedMonth}
                storiesByDate={storiesByDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date Sheet */}
      <DateSheet
        date={selectedDate}
        stories={selectedDateStories}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  )
}

function OnThisDayCard({ story }: { story: Story }) {
  const tags = parseStoryTags(story.tags)
  const d = new Date(story.createdAt)
  const dateStr = !isNaN(d.getTime())
    ? d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-secondary/50 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--orchid)]/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-5">
          <div className="flex-shrink-0 mt-1">
            <Moon className="w-5 h-5 text-[var(--orchid)] opacity-60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-2">
              On this day
            </p>
            <p className="text-xs text-[var(--muted)] mb-3">
              A story from another year...
            </p>
            <h3 className="font-[var(--font-instrument-serif)] text-xl md:text-2xl text-foreground mb-1 leading-snug">
              {story.title}
            </h3>
            <p className="text-xs text-[var(--foreground-secondary)] mb-3">
              {dateStr}
              {story.readingTime > 0 && <> · {story.readingTime} min read</>}
            </p>
            {story.excerpt && (
              <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 leading-relaxed mb-4">
                {story.excerpt}
              </p>
            )}
            <a
              href={`/stories/${story.slug}`}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--orchid)] hover:underline transition-colors font-[var(--font-grotesk)]"
            >
              Read again
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ViewSwitcher({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="relative inline-flex items-center rounded-full bg-secondary border border-[var(--border)] p-0.5">
      <div
        className="absolute top-0.5 bottom-0.5 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm transition-all duration-300 ease-out"
        style={{
          left: view === "timeline" ? "2px" : "calc(50% + 1px)",
          right: view === "timeline" ? "calc(50% + 1px)" : "2px",
        }}
      />
      {(["timeline", "calendar"] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`relative z-10 px-4 py-1.5 text-xs font-medium capitalize transition-colors duration-200 font-[var(--font-grotesk)] ${
            view === v ? "text-foreground" : "text-[var(--muted)] hover:text-[var(--foreground-secondary)]"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  )
}
