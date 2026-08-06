"use client"

import { useState, useEffect, use, useMemo, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  Heart,
  Quote,
  Maximize2,
  Minimize2,
  ArrowRight,
  Feather,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { StoryCard } from "@/components/StoryCard"
import { Stars } from "@/components/Stars"
import { formatDate, cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
import { parseStoryTags, MOOD_COLORS, type Mood } from "@/lib/constants"
import type { Story } from "@/types"

function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? `${window.location.origin}/stories/${slug}` : ""

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {})
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share story"
      className="p-2.5 rounded-full border border-white/[0.08] text-[var(--foreground-secondary)] hover:text-foreground hover:border-white/20 transition-colors"
    >
      {copied ? <span className="text-[10px] px-1 font-[var(--font-grotesk)]">Copied</span> : <Share2 className="w-4 h-4" />}
    </button>
  )
}

function BookmarkButton({ id }: { id: string }) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = JSON.parse(localStorage.getItem("bhavy-bookmarks") || "[]")
    setBookmarked(saved.includes(id))
  }, [id])

  const toggle = () => {
    const saved: string[] = JSON.parse(localStorage.getItem("bhavy-bookmarks") || "[]")
    const next = bookmarked ? saved.filter((s: string) => s !== id) : [...saved, id]
    localStorage.setItem("bhavy-bookmarks", JSON.stringify(next))
    setBookmarked(!bookmarked)
  }

  return (
    <button
      onClick={toggle}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark story"}
      aria-pressed={bookmarked}
      className={cn(
        "p-2.5 rounded-full border transition-colors",
        bookmarked
          ? "border-[var(--lavender)]/40 text-[var(--lavender)] bg-[var(--lavender)]/10"
          : "border-white/[0.08] text-[var(--foreground-secondary)] hover:text-foreground hover:border-white/20"
      )}
    >
      <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
    </button>
  )
}

function FavoriteButton({ id }: { id: string }) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = JSON.parse(localStorage.getItem("bhavy-favorites") || "[]")
    setFav(saved.includes(id))
  }, [id])

  const toggle = () => {
    const saved: string[] = JSON.parse(localStorage.getItem("bhavy-favorites") || "[]")
    const next = fav ? saved.filter((s: string) => s !== id) : [...saved, id]
    localStorage.setItem("bhavy-favorites", JSON.stringify(next))
    setFav(!fav)
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={cn(
        "p-2.5 rounded-full border transition-colors",
        fav
          ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
          : "border-white/[0.08] text-[var(--foreground-secondary)] hover:text-foreground hover:border-white/20"
      )}
    >
      <Heart className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
    </button>
  )
}

function extractQuote(content: string): string | null {
  const text = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (!sentences || sentences.length < 3) return null
  const mid = Math.floor(sentences.length / 2)
  const candidates = [sentences[mid], sentences[mid - 1], sentences[mid + 1]].filter(Boolean)
  const chosen = candidates[Math.floor(Math.random() * candidates.length)]?.trim()
  if (!chosen || chosen.length < 20) return null
  return chosen.length > 200 ? chosen.slice(0, 200) + "..." : chosen
}

export default function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [related, setRelated] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [readingMode, setReadingMode] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stories/${slug}`)
        const data = await res.json()
        setStory(data)

        try {
          const history: string[] = JSON.parse(localStorage.getItem("bhavy-reading-history") || "[]")
          const updated = [slug, ...history.filter((s: string) => s !== slug)].slice(0, 10)
          localStorage.setItem("bhavy-reading-history", JSON.stringify(updated))
        } catch {}

        if (data?.category) {
          const { data: relatedData } = await supabase
            .from("Story")
            .select("*")
            .eq("published", true)
            .eq("category", data.category)
            .neq("slug", slug)
            .limit(3)
          setRelated(relatedData || [])
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [slug])

  const tags = useMemo(() => parseStoryTags(story?.tags || ""), [story?.tags])
  const moodColor = tags.mood ? MOOD_COLORS[tags.mood as Mood] : undefined
  const accentColor = tags.accent || moodColor

  const quote = useMemo(() => {
    if (!story?.content) return null
    if (tags.quote) return tags.quote
    return extractQuote(story.content)
  }, [story?.content, tags.quote])

  const continueStory = useMemo(() => {
    if (!story) return null
    if (tags.continueSlug && tags.continueSlug !== story.slug) {
      return related.find((r) => r.slug === tags.continueSlug) || null
    }
    return related[0] || null
  }, [tags.continueSlug, related, story])

  const handleReadingMode = useCallback(() => {
    setReadingMode((m) => !m)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <ReadingProgress />
        <Navbar />
        <main className="pt-24 md:pt-32 max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-4">
            <div className="h-64 skeleton rounded-[32px]" />
            <div className="h-6 skeleton rounded w-1/3" />
            <div className="h-12 skeleton rounded w-3/4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 skeleton rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full" style={{ boxShadow: "0 0 40px rgba(167,139,250,0.15)" }} />
          <h1 className="text-3xl font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
            Story not found
          </h1>
          <Link href="/stories" className="text-sm text-[var(--muted)] hover:text-foreground mt-4 inline-block underline-animate">
            Back to stories
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen", readingMode && "reading-mode")}>
      <ReadingProgress />
      {!readingMode && <Navbar />}

      {/* Reading mode pill */}
      <AnimatePresence>
        {readingMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-[11px] text-[var(--foreground-secondary)] font-[var(--font-grotesk)] tracking-wide">
                Reading
              </span>
              <button
                onClick={handleReadingMode}
                className="text-[11px] text-foreground hover:opacity-80 transition-opacity font-[var(--font-grotesk)] flex items-center gap-1.5"
                aria-label="Exit reading mode"
              >
                <Minimize2 className="w-3 h-3" />
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn("relative", readingMode && "pt-10")}>
        {/* ===== HERO IMAGE ===== */}
        {!readingMode && (
          <div className={cn("relative overflow-hidden", story.coverImage ? "h-[46vh] md:h-[62vh] min-h-[320px]" : "h-[32vh] min-h-[240px]")}>
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
                    "w-full h-full object-cover",
                    imageLoaded ? "opacity-100 animate-image-reveal" : "opacity-0"
                  )}
                  style={tags.coverPos ? { objectPosition: `${tags.coverPos.x}% ${tags.coverPos.y}%` } : undefined}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={
                  moodColor
                    ? { background: `linear-gradient(150deg, ${moodColor}18 0%, #000 60%)` }
                    : { background: "linear-gradient(150deg, rgba(177,108,234,0.12) 0%, #000 60%)" }
                }
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
            <Stars count={24} />
          </div>
        )}

        {/* ===== FLOATING INFO CARD ===== */}
        <article className={cn("mx-auto px-5 md:px-6 relative z-10", readingMode ? "max-w-3xl" : "max-w-6xl")}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: readingMode ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              !readingMode &&
                "md:-mt-24 glass-card p-7 md:p-10 rounded-[28px] md:rounded-[36px] relative"
            )}
          >
            <div className="max-w-3xl mx-auto">
              {/* Back link */}
              {!readingMode && (
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors mb-7"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All stories
                </Link>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                {story.category && (
                  <span
                    className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border font-[var(--font-grotesk)]"
                    style={{
                      color: accentColor || "var(--lavender)",
                      borderColor: `${accentColor || "var(--lavender)"}35`,
                      background: `${accentColor || "var(--lavender)"}0d`,
                    }}
                  >
                    {story.category}
                  </span>
                )}
                {tags.mood && (
                  <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border border-white/[0.08] text-[var(--foreground-secondary)] font-[var(--font-grotesk)]">
                    {tags.mood}
                  </span>
                )}
                {tags.collection && (
                  <Link
                    href={`/stories?collection=${encodeURIComponent(tags.collection.toLowerCase())}`}
                    className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] border border-white/[0.08] text-[var(--foreground-secondary)] hover:text-foreground transition-colors font-[var(--font-grotesk)]"
                  >
                    {tags.collection}
                  </Link>
                )}
              </div>

              <h1
                className={cn(
                  "text-foreground leading-[1.1]",
                  readingMode ? "text-3xl md:text-4xl" : "text-3xl md:text-5xl"
                )}
              >
                {story.title}
              </h1>
              {story.subtitle && (
                <p className="text-base md:text-lg text-[var(--foreground-secondary)] mt-3 font-[var(--font-source-serif)] italic">
                  {story.subtitle}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6 text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1.5 font-[var(--font-grotesk)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(story.createdAt)}
                </span>
                <span className="flex items-center gap-1.5 font-[var(--font-grotesk)]">
                  <Clock className="w-3.5 h-3.5" />
                  {story.readingTime || 5} min read
                </span>
                <span className="flex items-center gap-1.5 font-[var(--font-grotesk)]">
                  <Feather className="w-3.5 h-3.5" />
                  by Bhavya
                </span>

                <div className="flex items-center gap-2 ml-auto">
                  {!readingMode && (
                    <button
                      onClick={handleReadingMode}
                      aria-label="Enter reading mode"
                      title="Reading mode"
                      className="p-2.5 rounded-full border border-white/[0.08] text-[var(--foreground-secondary)] hover:text-foreground hover:border-white/20 transition-colors"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                  <FavoriteButton id={story.id} />
                  <BookmarkButton id={story.id} />
                  <ShareButton title={story.title} slug={story.slug} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== HIGHLIGHTED QUOTE ===== */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="max-w-3xl mx-auto my-10 md:my-14"
            >
              <div className="relative px-2">
                <Quote
                  className="w-8 h-8 mb-4"
                  style={{ color: accentColor || "var(--lavender)" }}
                />
                <p className="font-[var(--font-instrument-serif)] italic text-2xl md:text-3xl leading-[1.4] text-foreground">
                  &ldquo;{quote}&rdquo;
                </p>
                <div
                  className="mt-6 h-px w-16"
                  style={{ background: `linear-gradient(to right, ${accentColor || "var(--lavender)"}, transparent)` }}
                />
              </div>
            </motion.div>
          )}

          {/* ===== STORY BODY ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl mx-auto"
          >
            <div
              className={cn("reading-prose", readingMode && "reading-prose-large")}
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          </motion.div>

          {/* ===== THANK YOU + SIGNATURE ===== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl mx-auto mt-16 md:mt-24 pt-10 border-t border-white/[0.06] text-center"
          >
            <p className="font-[var(--font-instrument-serif)] italic text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto">
              Thank you for reading this far.
            </p>
            <p className="font-[var(--font-great-vibes)] text-3xl md:text-4xl gradient-logo mt-6">
              Bhavya
            </p>
          </motion.div>
        </article>

        {/* ===== CONTINUE READING ===== */}
        {continueStory && !readingMode && (
          <section className="max-w-6xl mx-auto px-5 md:px-6 mt-20 md:mt-28">
            <div className="glass-card rounded-[32px] overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative min-h-[240px] bg-[#0a0a0c]">
                  {continueStory.coverImage ? (
                    <img
                      src={continueStory.coverImage}
                      alt={continueStory.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1024] via-[#0a0a0c] to-[#0d1a24]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent hidden md:block" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-3">
                    Continue Reading
                  </p>
                  <h3 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-foreground leading-snug">
                    {continueStory.title}
                  </h3>
                  <p className="text-sm text-[var(--foreground-secondary)] mt-3 line-clamp-2 leading-relaxed">
                    {continueStory.excerpt}
                  </p>
                  <Link
                    href={`/stories/${continueStory.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-foreground mt-6 w-fit group"
                  >
                    <span className="underline-animate">Read next</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== RELATED STORIES ===== */}
        {related.length > 0 && !readingMode && (
          <section className="max-w-6xl mx-auto px-5 md:px-6 mt-16 md:mt-24">
            <div className="mb-8 flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)]">
                More in {story.category}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {related.map((r, i) => (
                <StoryCard key={r.id} story={r} index={i} />
              ))}
            </div>
          </section>
        )}
      </main>

      {!readingMode && (
        <>
          <Footer />
          <FloatingWriteButton />
        </>
      )}
    </div>
  )
}
