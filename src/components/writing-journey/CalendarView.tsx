"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { parseStoryTags } from "@/lib/constants"
import type { Story } from "@/types"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface CalendarViewProps {
  year: number
  month: number
  storiesByDate: Map<string, Story[]>
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function CalendarView({ year, month, storiesByDate, selectedDate, onSelectDate }: CalendarViewProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)

  const cells = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [firstDay, daysInMonth])

  const weeks = useMemo(() => {
    const w: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      w.push(cells.slice(i, i + 7))
    }
    return w
  }, [cells])

  return (
    <div>
      {/* Month summary */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-secondary border border-[var(--border)]">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-[var(--font-grotesk)]">
            {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] font-[var(--font-grotesk)] py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="aspect-square" />

              const dateKey = formatDateKey(year, month, day)
              const dayStories = storiesByDate.get(dateKey) || []
              const hasStories = dayStories.length > 0
              const isSelected = selectedDate === dateKey
              const accentColor = hasStories
                ? parseStoryTags(dayStories[0].tags).accent || "var(--orchid)"
                : undefined

              return (
                <button
                  key={di}
                  onClick={() => onSelectDate(isSelected ? null : dateKey)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                    isSelected
                      ? "bg-secondary border border-[var(--orchid)]/30"
                      : hasStories
                        ? "hover:bg-secondary/60 border border-transparent hover:border-[var(--border)]"
                        : "border border-transparent hover:bg-secondary/30"
                  }`}
                  aria-label={`${day}${hasStories ? `, ${dayStories.length} ${dayStories.length === 1 ? "story" : "stories"}` : ""}`}
                >
                  <span
                    className={`text-sm font-[var(--font-grotesk)] ${
                      isSelected
                        ? "text-foreground font-medium"
                        : hasStories
                          ? "text-foreground"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {day}
                  </span>

                  {hasStories && (
                    <div className="flex items-center gap-0.5">
                      {dayStories.length <= 3 ? (
                        dayStories.map((_, i) => (
                          <span
                            key={i}
                            className="w-1 h-1 rounded-full transition-colors duration-200"
                            style={{
                              backgroundColor: isSelected
                                ? accentColor || "var(--orchid)"
                                : `${accentColor || "var(--orchid)"}80`,
                            }}
                          />
                        ))
                      ) : (
                        <span className="text-[8px] text-[var(--muted)] font-[var(--font-grotesk)]">
                          {dayStories.length}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tiny cover preview on desktop */}
                  {hasStories && dayStories[0].coverImage && (
                    <div className="hidden md:block absolute inset-x-1 bottom-1 h-6 rounded overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                      <img
                        src={dayStories[0].coverImage}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--orchid)]" />
          <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">Writing day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)] opacity-30" />
          <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">Quiet day</span>
        </div>
      </div>
    </div>
  )
}
