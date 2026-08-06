"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight,
  ArrowDown,
  BookOpen,
  Sparkles,
  Quote,
  Feather,
  Star,
  Moon,
} from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { MoonPhase } from "./MoonPhase"
import { Stars } from "./Stars"
import { Logo } from "./Logo"
import {
  DAILY_THOUGHTS,
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  MOODS,
  MOOD_DESCRIPTIONS,
  MOOD_COLORS,
  parseStoryTags,
  type CollectionType,
  type Mood,
} from "@/lib/constants"
import type { Story } from "@/types"

function getDailyThought(): string {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  return DAILY_THOUGHTS[dayOfYear % DAILY_THOUGHTS.length]
}

function getReadingHistory(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("bhavy-reading-history") || "[]")
  } catch {
    return []
  }
}

function getStoredList(key: string): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(key) || "[]")
  } catch {
    return []
  }
}

function SectionHeading({ eyebrow, title, link }: { eyebrow?: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl md:text-3xl text-foreground">{title}</h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors group"
        >
          {link.label}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`max-w-6xl mx-auto px-5 md:px-6 py-12 md:py-16 ${className}`}>
      {children}
    </section>
  )
}

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [readingHistory, setReadingHistory] = useState<string[]>([])
  const dailyThought = useMemo(() => getDailyThought(), [])

  useEffect(() => {
    setReadingHistory(getReadingHistory())
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .eq("published", true)
          .order("createdAt", { ascending: false })
        if (data) setStories(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const featured = useMemo(
    () => stories.find((s) => s.featured) || stories[0] || null,
    [stories]
  )

  const rest = useMemo(() => stories.filter((s) => s.slug !== featured?.slug), [stories, featured])

  const latest = rest.slice(0, 6)

  const { editorsPicks, recommended } = useMemo(() => {
    const picks: Story[] = []
    const recs: Story[] = []
    for (const s of stories) {
      const t = parseStoryTags(s.tags)
      if (t.editorsPick) picks.push(s)
      if (t.recommended) recs.push(s)
    }
    return { editorsPicks: picks, recommended: recs }
  }, [stories])

  const continueReading = useMemo(() => {
    if (readingHistory.length === 0) return []
    return readingHistory
      .map((slug) => stories.find((s) => s.slug === slug))
      .filter((s): s is Story => Boolean(s))
      .slice(0, 3)
  }, [readingHistory, stories])

  const popular = useMemo(() => {
    // Proxy for popularity: this reader's history + favorited + bookmarked stories first
    const history = getReadingHistory()
    const favs = getStoredList("bhavy-favorites")
    const marks = getStoredList("bhavy-bookmarks")
    const ids = [...history, ...favs, ...marks]
    const scored = new Map<string, number>()
    ids.forEach((id, i) => {
      scored.set(id, (scored.get(id) || 0) + Math.max(0, 100 - i))
    })
    const ranked = stories
      .map((s) => ({ s, score: scored.get(s.id) || 0 }))
      .sort((a, b) => b.score - a.score || b.s.readingTime - a.s.readingTime)
    const withScore = ranked.filter((r) => r.score > 0).map((r) => r.s)
    const fill = ranked.filter((r) => r.score === 0).map((r) => r.s)
    return [...withScore, ...fill].slice(0, 6)
  }, [stories])

  const collections = useMemo(() => {
    const map = new Map<CollectionType, Story[]>()
    for (const story of stories) {
      const { collection } = parseStoryTags(story.tags)
      if (collection) {
        if (!map.has(collection)) map.set(collection, [])
        map.get(collection)!.push(story)
      }
    }
    return Array.from(map.entries()).slice(0, 6)
  }, [stories])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="max-w-6xl mx-auto px-5 pt-32 pb-10 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-3xl skeleton" />
            ))}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative">
        {/* ===== HERO ===== */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden">
          <Stars count={20} />
          <div className="max-w-6xl mx-auto px-5 md:px-6 w-full pt-28 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <p className="text-[11px] uppercase tracking-[0.35em] text-[var(--muted)] font-[var(--font-grotesk)] mb-6">
                A Digital Journal · {new Date().getFullYear()}
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl leading-[1.08] text-foreground">
                Where stories sleep
                <br />
                <span className="italic gradient-text">under the moonlight.</span>
              </h1>
              <p className="text-base md:text-lg text-[var(--foreground-secondary)] leading-relaxed max-w-xl mt-6">
                Bhavya Writes is a quiet corner of the internet where thoughts become tales —
                written slowly, kept gently, shared under the stars.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-9">
                <Link
                  href={featured ? `/stories/${featured.slug}` : "/stories"}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-medium px-6 py-3 hover:bg-white/90 transition-colors"
                >
                  {featured ? "Start Reading" : "Browse Stories"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full text-sm text-[var(--foreground-secondary)] hover:text-foreground px-2 py-3 transition-colors underline-animate"
                >
                  Who is Bhavya?
                </Link>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--muted)]"
            aria-hidden="true"
          >
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </motion.div>
        </section>

        {/* ===== ABOUT BHAVYA WRITES ===== */}
        <Section className="pt-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] glass-card p-8 md:p-14 text-center"
          >
            <div className="absolute -top-20 right-0 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(177,108,234,0.08), transparent 65%)" }} />
            <div className="relative">
              <div className="mx-auto mb-6">
                <Logo size="lg" shine />
              </div>
              <p className="text-lg md:text-2xl font-[var(--font-source-serif)] text-[var(--foreground-secondary)] leading-relaxed max-w-2xl mx-auto italic">
                &ldquo;I write the way the moon rises — slowly, quietly,
                whether or not anyone is watching.&rdquo;
              </p>
              <p className="font-[var(--font-great-vibes)] text-2xl text-[var(--lavender)] mt-6">
                — Bhavya
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground mt-6 transition-colors group"
              >
                Read the letter
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </Section>

        {/* ===== THOUGHT OF THE DAY + MOON ===== */}
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8 }}
              className="md:col-span-3 glass-card rounded-[28px] p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(167,139,250,0.06), transparent 65%)" }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <Quote className="w-4 h-4 text-[var(--lavender)]" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)]">
                    Thought of the Day
                  </p>
                </div>
                <p className="font-[var(--font-instrument-serif)] italic text-2xl md:text-[28px] leading-[1.4] text-foreground">
                  &ldquo;{dailyThought}&rdquo;
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="md:col-span-2 glass-card rounded-[28px] p-8 flex items-center"
            >
              <MoonPhase />
            </motion.div>
          </div>
        </Section>

        {/* ===== FEATURED STORY ===== */}
        {featured && (
          <Section>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--orchid)]" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)]">
                  Featured Story
                </span>
              </div>
              <Link href={`/stories/${featured.slug}`} className="group block">
                <div
                  className="relative overflow-hidden rounded-[36px]"
                  style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}
                >
                  <div className="aspect-[21/9] md:aspect-[24/9] relative bg-[#0a0a0c]">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1024] via-[#0a0a0c] to-[#0d1a24]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {featured.category && (
                          <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] backdrop-blur-md border border-white/15 bg-black/30 text-white font-[var(--font-grotesk)]">
                            {featured.category}
                          </span>
                        )}
                        <span className="text-[11px] text-white/60 font-[var(--font-grotesk)]">
                          {featured.readingTime || 5} min read
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-5xl text-white leading-[1.15] max-w-3xl">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-white/60 text-sm md:text-base mt-3 max-w-2xl line-clamp-2 leading-relaxed hidden md:block">
                          {featured.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-xs text-white mt-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        Read the story
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </Section>
        )}

        {/* ===== CONTINUE READING ===== */}
        {continueReading.length > 0 && (
          <Section>
            <SectionHeading
              eyebrow="Pick up where you left off"
              title="Continue Reading"
              link={{ href: "/stories", label: "All stories" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {continueReading.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* ===== EDITOR'S PICKS ===== */}
        {editorsPicks.length > 0 && (
          <Section>
            <SectionHeading
              eyebrow="Handpicked by the editor"
              title="Editor's Picks"
              link={{ href: "/stories", label: "See all" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {editorsPicks.slice(0, 3).map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* ===== LATEST STORIES ===== */}
        <Section>
          <SectionHeading
            eyebrow="Newly written"
            title="Latest Stories"
            link={{ href: "/stories", label: "View all" }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {latest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </Section>

        {/* ===== POPULAR STORIES ===== */}
        {popular.length > 0 && (
          <Section>
            <SectionHeading
              eyebrow="Most loved by readers"
              title="Popular Stories"
              link={{ href: "/stories", label: "Browse more" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {popular.slice(0, 6).map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* ===== COLLECTIONS ===== */}
        {collections.length > 0 && (
          <Section>
            <SectionHeading
              eyebrow="Themes and series"
              title="Collections"
              link={{ href: "/collections", label: "All collections" }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {collections.map(([collection, storiesInCol], i) => (
                <motion.div
                  key={collection}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
                >
                  <Link
                    href={`/stories?collection=${encodeURIComponent(collection)}`}
                    className="group block h-full"
                  >
                    <div className="glass-card overflow-hidden h-full hover-lift" style={{ borderRadius: 28 }}>
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0c]">
                        {storiesInCol[0]?.coverImage ? (
                          <img
                            src={storiesInCol[0].coverImage}
                            alt={collection}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: `linear-gradient(140deg, ${COLLECTION_ACCENTS[collection]}26, #0a0a0c 75%)` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div
                          className="absolute bottom-4 left-5 right-5"
                          style={{ borderBottom: `2px solid ${COLLECTION_ACCENTS[collection]}55` }}
                        />
                        <div className="absolute top-4 left-5 flex items-center gap-2">
                          <Moon className="w-3.5 h-3.5" style={{ color: COLLECTION_ACCENTS[collection] }} />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-[var(--font-grotesk)]">
                            Collection
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-[var(--font-instrument-serif)] text-foreground leading-snug">
                          {collection}
                        </h3>
                        <p className="text-sm text-[var(--foreground-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                          {COLLECTION_DESCRIPTIONS[collection]}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-3 font-[var(--font-grotesk)]">
                          {storiesInCol.length} {storiesInCol.length === 1 ? "story" : "stories"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ===== MOOD CATEGORIES ===== */}
        <Section>
          <SectionHeading
            eyebrow="Find what you're feeling"
            title="Browse by Mood"
            link={{ href: "/stories", label: "All moods" }}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MOODS.map((mood, i) => (
              <motion.div
                key={mood}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.05 }}
              >
                <Link
                  href={`/stories?mood=${mood.toLowerCase()}`}
                  className="group block glass-card rounded-2xl p-5 hover-lift"
                >
                  <div
                    className="w-8 h-8 rounded-full mb-4 transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${MOOD_COLORS[mood as Mood]}, transparent 75%)`,
                      boxShadow: `0 0 20px ${MOOD_COLORS[mood as Mood]}40`,
                    }}
                  />
                  <h3 className="font-[var(--font-instrument-serif)] text-lg text-foreground">{mood}</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">{MOOD_DESCRIPTIONS[mood as Mood]}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ===== RECOMMENDED READS ===== */}
        {(recommended.length > 0 || stories.length > 0) && (
          <Section>
            <SectionHeading
              eyebrow="If you have a moment"
              title="Recommended Reads"
              link={{ href: "/stories", label: "Explore more" }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {(recommended.length > 0 ? recommended : rest.slice(6, 9)).map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </Section>
        )}

        {/* ===== CLOSING ===== */}
        <Section className="pt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-full" style={{ boxShadow: "0 0 50px rgba(167,139,250,0.2)" }}>
              <div
                className="w-full h-full rounded-full"
                style={{ background: "radial-gradient(circle at 35% 35%, #f5f0ff 0%, #d5c8f2 50%, #a996e0 100%)" }}
              />
            </div>
            <p className="font-[var(--font-instrument-serif)] italic text-xl md:text-2xl text-foreground leading-relaxed max-w-md mx-auto">
              &ldquo;Thank you for reading.
              <br />
              These stories were written just for you.&rdquo;
            </p>
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 text-sm px-6 py-3 mt-8 text-[var(--foreground-secondary)] hover:text-foreground hover:border-white/25 transition-colors"
            >
              <Feather className="w-4 h-4" />
              Keep reading
            </Link>
          </motion.div>
        </Section>

        {/* Empty state */}
        {stories.length === 0 && (
          <Section>
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--muted)]" />
              </div>
              <p className="text-sm text-[var(--foreground-secondary)]">No stories yet. The first page awaits.</p>
            </div>
          </Section>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </>
  )
}
