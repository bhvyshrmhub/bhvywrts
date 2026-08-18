"use client"

import { useState, useEffect, useMemo, use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Moon, Feather } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { StoryCard } from "@/components/StoryCard"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { supabase } from "@/lib/supabase-client"
import {
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  parseStoryTags,
  type CollectionType,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

interface GroupedMonth {
  month: number
  label: string
  stories: Story[]
}

interface GroupedYear {
  year: number
  months: GroupedMonth[]
}

function toDate(s: Story): Date | null {
  const d = new Date(s.createdAt)
  return Number.isNaN(d.getTime()) ? null : d
}

function groupByDate(stories: Story[]): { years: GroupedYear[]; undated: Story[] } {
  const dated: Array<{ story: Story; date: Date }> = []
  const undated: Story[] = []
  for (const s of stories) {
    const d = toDate(s)
    if (d) dated.push({ story: s, date: d })
    else undated.push(s)
  }
  dated.sort((a, b) => b.date.getTime() - a.date.getTime())

  const yearMap = new Map<number, GroupedYear>()
  const monthMap = new Map<number, GroupedMonth>()

  for (const { story, date } of dated) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthKey = year * 12 + month
    let groupYear = yearMap.get(year)
    if (!groupYear) {
      groupYear = { year, months: [] }
      yearMap.set(year, groupYear)
    }
    let groupMonth = monthMap.get(monthKey)
    if (!groupMonth) {
      groupMonth = {
        month,
        label: date.toLocaleDateString("en-US", { month: "long" }),
        stories: [],
      }
      monthMap.set(monthKey, groupMonth)
      groupYear.months.push(groupMonth)
    }
    groupMonth.stories.push(story)
  }

  const years = Array.from(yearMap.values()).sort((a, b) => b.year - a.year)
  for (const y of years) y.months.sort((a, b) => b.month - a.month)

  return { years, undated }
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const collection = useMemo<CollectionType | null>(() => {
    const needle = decodeURIComponent(slug).toLowerCase()
    return COLLECTIONS.find((c) => c.toLowerCase() === needle) || null
  }, [slug])

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .eq("published", true)
          .order("createdAt", { ascending: false })
        if (data) {
          const filtered = data.filter((s) => {
            const tags = parseStoryTags(s.tags)
            return tags.collection === collection
          })
          setStories(filtered)
        }
      } catch {}
      setLoading(false)
    }
    if (collection) load()
    else setLoading(false)
  }, [collection])

  const grouped = useMemo(() => groupByDate(stories), [stories])

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-32 md:pt-40">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-16">
          {!collection ? (
            <div className="text-center py-24">
              <Moon className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
              <p className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                This collection hasn&apos;t been opened yet.
              </p>
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-foreground mt-4 underline-animate"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to collections
              </Link>
            </div>
          ) : (
            <>
              {/* Collection header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center mb-12"
              >
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All collections
                </Link>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Moon
                    className="w-4 h-4"
                    style={{ color: COLLECTION_ACCENTS[collection] }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)]">
                    Collection
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl text-foreground">{collection}</h1>
                <p className="text-sm md:text-base text-[var(--foreground-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
                  {COLLECTION_DESCRIPTIONS[collection]}
                </p>
                <p className="text-xs text-[var(--muted)] mt-4 font-[var(--font-grotesk)]">
                  {stories.length} {stories.length === 1 ? "story" : "stories"} · newest first
                </p>
              </motion.div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-80 rounded-[28px] skeleton" />
                  ))}
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-24">
                  <Feather className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
                  <p className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                    Nothing has been written here yet.
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-2">
                    This collection is still waiting for its first story.
                  </p>
                </div>
              ) : (
                <div className="space-y-14">
                  {grouped.years.map((yearGroup, yi) => (
                    <section key={yearGroup.year}>
                      <div className="flex items-center gap-4 mb-7">
                        <h2 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-foreground">
                          {yearGroup.year}
                        </h2>
                        <span className="h-px flex-1 bg-gradient-to-r from-[var(--border-strong)] to-transparent" />
                      </div>

                      <div className="space-y-10">
                        {yearGroup.months.map((monthGroup) => (
                          <div key={`${yearGroup.year}-${monthGroup.month}`}>
                            <div className="flex items-center gap-3 mb-5">
                              <h3 className="text-[11px] uppercase tracking-[0.25em] text-[var(--foreground-secondary)] font-[var(--font-grotesk)]">
                                {monthGroup.label}
                              </h3>
                              <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)]" />
                              <span className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                                {monthGroup.stories.length} {monthGroup.stories.length === 1 ? "story" : "stories"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                              {monthGroup.stories.map((story, i) => (
                                <StoryCard key={story.id} story={story} index={i} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                  {/* Stories without a valid date — placed safely at the end */}
                  {grouped.undated.length > 0 && (
                    <section>
                      <div className="flex items-center gap-4 mb-7">
                        <h2 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-foreground">
                          Undated
                        </h2>
                        <span className="h-px flex-1 bg-gradient-to-r from-[var(--border-strong)] to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {grouped.undated.map((story, i) => (
                          <StoryCard key={story.id} story={story} index={i} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
