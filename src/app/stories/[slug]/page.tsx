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
  Lock,
  Eye,
  Loader2,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { StoryCard } from "@/components/StoryCard"
import { formatDate, cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
import { parseStoryTags, MOOD_COLORS, type Mood } from "@/lib/constants"
import type { Story } from "@/types"

const SKELETON_WIDTHS = ["78%", "92%", "64%", "88%", "70%", "82%", "60%", "90%"]

function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/stories/${slug}`
      : ""

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
      type="button"
      onClick={handleShare}
      aria-label="Share story"
      className="p-2.5 rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)] transition-all"
    >
      {copied ? (
        <span className="text-[10px] px-1 font-[var(--font-grotesk)] text-[var(--orchid)]">
          Copied
        </span>
      ) : (
        <Share2 className="w-4 h-4" />
      )}
    </button>
  )
}

function BookmarkButton({ id }: { id: string }) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = JSON.parse(localStorage.getItem("bhavy-bookmarks") || "[]")
      setBookmarked(saved.includes(id))
    } catch {}
  }, [id])

  const toggle = () => {
    try {
      const saved: string[] = JSON.parse(
        localStorage.getItem("bhavy-bookmarks") || "[]"
      )
      const next = bookmarked
        ? saved.filter((s: string) => s !== id)
        : [...saved, id]

      localStorage.setItem("bhavy-bookmarks", JSON.stringify(next))
      setBookmarked(!bookmarked)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark story"}
      aria-pressed={bookmarked}
      className={cn(
        "p-2.5 rounded-full border transition-all",
        bookmarked
          ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)]"
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
    try {
      const saved = JSON.parse(localStorage.getItem("bhavy-favorites") || "[]")
      setFav(saved.includes(id))
    } catch {}
  }, [id])

  const toggle = () => {
    try {
      const saved: string[] = JSON.parse(
        localStorage.getItem("bhavy-favorites") || "[]"
      )
      const next = fav ? saved.filter((s: string) => s !== id) : [...saved, id]

      localStorage.setItem("bhavy-favorites", JSON.stringify(next))
      setFav(!fav)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={fav}
      className={cn(
        "p-2.5 rounded-full border transition-all",
        fav
          ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)]"
      )}
    >
      <Heart className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
    </button>
  )
}

function extractQuote(content: string): string | null {
  const text = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const sentences = text.match(/[^.!?]+[.!?]+/g)
  if (!sentences || sentences.length < 3) return null

  const mid = Math.floor(sentences.length / 2)
  const chosen = sentences[mid]?.trim()
  if (!chosen || chosen.length < 20) return null

  return chosen.length > 200 ? chosen.slice(0, 200) + "..." : chosen
}

function LockedStory({
  story,
  slug,
  onUnlocked,
}: {
  story: Partial<Story>
  slug: string
  onUnlocked: () => void
}) {
  const [password, setPassword] = useState("")
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState("")

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim()) {
      setError("Please enter the password.")
      return
    }

    setUnlocking(true)
    setError("")

    try {
      const res = await fetch(`/api/stories/${slug}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Incorrect password.")
        setUnlocking(false)
        return
      }

      setPassword("")
      onUnlocked()
    } catch {
      setError("Something went wrong. Please try again.")
      setUnlocking(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Atmospheric Orchid Ambient Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.10]"
          style={{
            background: "radial-gradient(circle, rgba(232,121,249,0.8), transparent 70%)",
          }}
        />
      </div>

      <main className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Back to archive link */}
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors mb-7 font-[var(--font-grotesk)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All stories
          </Link>

          {/* Locked Card */}
          <div className="glass-card rounded-[28px] md:rounded-[32px] p-7 md:p-10 text-center relative overflow-hidden border border-[var(--border)]">
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] opacity-25 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(232,121,249,0.9), transparent 75%)",
              }}
            />

            {/* Lock emblem */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative mx-auto w-16 h-16 rounded-full border border-[var(--border-strong)] bg-secondary flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(232,121,249,0.15)]"
            >
              <Lock className="w-6 h-6 text-[var(--orchid)]" />
            </motion.div>

            {/* Eyebrow */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-3 font-medium">
              Private Story
            </p>

            {/* Title */}
            <h1 className="font-[var(--font-instrument-serif)] text-3xl md:text-3.5xl text-foreground leading-tight">
              {story.title || "This story is private"}
            </h1>

            {story.subtitle && (
              <p className="mt-2.5 text-sm text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic">
                {story.subtitle}
              </p>
            )}

            <p className="mt-4 text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed max-w-sm mx-auto font-[var(--font-source-serif)]">
              This entry is protected with a password. Enter it below to unlock and read.
            </p>

            {/* Password Unlock Form */}
            <form onSubmit={handleUnlock} className="mt-7">
              <div className="relative">
                <Eye className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError("")
                  }}
                  placeholder="Enter story password"
                  autoComplete="current-password"
                  className={cn(
                    "w-full h-12 rounded-full border bg-black/20 pl-11 pr-5 text-sm text-foreground outline-none transition-all font-[var(--font-grotesk)]",
                    "placeholder:text-[var(--muted)]",
                    "focus:border-[var(--orchid)]/60 focus:ring-4 focus:ring-[var(--orchid)]/10",
                    error ? "border-red-400/50" : "border-[var(--border)]"
                  )}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-red-400 mt-2.5 text-center font-[var(--font-grotesk)]"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={unlocking}
                className={cn(
                  "w-full h-12 mt-4 rounded-full font-[var(--font-grotesk)] text-sm font-medium",
                  "flex items-center justify-center gap-2",
                  "transition-all duration-300 shadow-sm",
                  "bg-foreground text-background",
                  "hover:opacity-90 active:scale-98",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {unlocking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--orchid)]" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Unlock Story</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--muted)] leading-relaxed font-[var(--font-grotesk)]">
                This story is private and accessible only with the key from the author.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)

  const [story, setStory] = useState<Story | null>(null)
  const [lockedStory, setLockedStory] = useState<Partial<Story> | null>(null)
  const [related, setRelated] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [readingMode, setReadingMode] = useState(false)

  const loadStory = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/stories/${slug}`)
      const data = await res.json()

      // Locked story handling
      if (res.status === 423 && data?.locked) {
        setStory(null)
        setLockedStory(data.story || null)
        setLoading(false)
        return
      }

      if (!res.ok || !data || data.error) {
        setStory(null)
        setLockedStory(null)
        setLoading(false)
        return
      }

      setLockedStory(null)
      setStory(data)

      try {
        const history: string[] = JSON.parse(
          localStorage.getItem("bhavy-reading-history") || "[]"
        )
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
    } catch {
      setStory(null)
      setLockedStory(null)
    }

    setLoading(false)
  }, [slug])

  useEffect(() => {
    loadStory()
  }, [loadStory])

  const tags = useMemo(() => parseStoryTags(story?.tags || ""), [story?.tags])
  const moodColor = tags.mood ? MOOD_COLORS[tags.mood as Mood] : undefined
  const accentColor = tags.accent || moodColor || "var(--orchid)"

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
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <ReadingProgress />
        <Navbar />
        <main className="pt-24 md:pt-32 max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-4">
            <div className="h-72 skeleton rounded-[24px]" />
            <div className="h-6 skeleton rounded w-1/3" />
            <div className="h-12 skeleton rounded w-3/4" />
            <div className="space-y-3 pt-4">
              {SKELETON_WIDTHS.map((w, i) => (
                <div key={i} className="h-4 skeleton rounded" style={{ width: w }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (lockedStory) {
    return <LockedStory story={lockedStory} slug={slug} onUnlocked={loadStory} />
  }

  if (!story) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-32 max-w-3xl mx-auto px-6 py-20 text-center">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full"
            style={{
              boxShadow: "0 0 40px rgba(232, 121, 249, 0.15)",
            }}
          />
          <h1 className="text-3xl font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
            Story not found
          </h1>
          <Link
            href="/stories"
            className="text-sm text-[var(--muted)] hover:text-foreground mt-4 inline-block underline-animate font-[var(--font-grotesk)]"
          >
            Back to stories
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen relative", readingMode && "reading-mode")}>
      <ReadingProgress />
      {!readingMode && <Navbar />}

      {/* Floating Reading Mode Toggle Pill */}
      <AnimatePresence>
        {readingMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-3 shadow-lg border border-[var(--border)]">
              <span className="text-[11px] text-[var(--foreground-secondary)] font-[var(--font-grotesk)] tracking-wide">
                Reading Mode
              </span>
              <button
                type="button"
                onClick={handleReadingMode}
                className="text-[11px] text-foreground hover:opacity-80 transition-opacity font-[var(--font-grotesk)] flex items-center gap-1.5"
                aria-label="Exit reading mode"
              >
                <Minimize2 className="w-3 h-3 text-[var(--orchid)]" />
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn("relative", readingMode && "pt-12")}>
        {/* CINEMATIC HERO COVER */}
        {!readingMode && (
          <div
            className={cn(
              "relative overflow-hidden bg-[#09090c]",
              story.coverImage ? "h-[50vh] md:h-[65vh] min-h-[340px]" : "h-[35vh] min-h-[260px]"
            )}
          >
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
                  style={
                    tags.coverPos
                      ? { objectPosition: `${tags.coverPos.x}% ${tags.coverPos.y}%` }
                      : undefined
                  }
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(150deg, ${moodColor || "rgba(232,121,249,0.12)"} 0%, #050505 70%)`,
                }}
              />
            )}

            {/* Gradient Fade to Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/35 to-black/30" />
          </div>
        )}

        {/* FLOATING EDITORIAL HEADER CARD */}
        <article className={cn("mx-auto px-4 sm:px-6 relative z-10", readingMode ? "max-w-3xl" : "max-w-5xl")}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: readingMode ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              !readingMode &&
                "md:-mt-28 glass-card p-6 sm:p-8 md:p-12 rounded-[24px] md:rounded-[32px] relative shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-[var(--border)]"
            )}
          >
            <div className="max-w-3xl mx-auto">
              {!readingMode && (
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors mb-7 font-[var(--font-grotesk)]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All stories
                </Link>
              )}

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {story.category && (
                  <span
                    className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] border font-[var(--font-grotesk)] font-medium"
                    style={{
                      color: accentColor,
                      borderColor: `${accentColor}40`,
                      background: `${accentColor}12`,
                    }}
                  >
                    {story.category}
                  </span>
                )}

                {tags.mood && (
                  <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] border border-[var(--border)] text-[var(--foreground-secondary)] font-[var(--font-grotesk)]">
                    {tags.mood}
                  </span>
                )}

                {tags.collection && (
                  <Link
                    href={`/collections/${encodeURIComponent(tags.collection.toLowerCase())}`}
                    className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground transition-colors font-[var(--font-grotesk)]"
                  >
                    {tags.collection}
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1
                className={cn(
                  "text-foreground font-[var(--font-instrument-serif)] leading-[1.12] tracking-tight",
                  readingMode ? "text-3xl md:text-4.5xl" : "text-3xl sm:text-4xl md:text-5xl"
                )}
              >
                {story.title}
              </h1>

              {/* Subtitle */}
              {story.subtitle && (
                <p className="text-base sm:text-lg text-[var(--foreground-secondary)] mt-3.5 font-[var(--font-source-serif)] italic leading-relaxed">
                  {story.subtitle}
                </p>
              )}

              {/* Meta row & Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-y-4 gap-x-6 mt-7 pt-6 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-[var(--font-grotesk)]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(story.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {story.readingTime || 5} min read
                  </span>
                  <span className="flex items-center gap-1.5 text-[var(--foreground-secondary)]">
                    <Feather className="w-3.5 h-3.5 text-[var(--orchid)]" />
                    by Bhavya
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {!readingMode && (
                    <button
                      type="button"
                      onClick={handleReadingMode}
                      aria-label="Enter reading mode"
                      title="Reading mode"
                      className="p-2.5 rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
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

          {/* HIGHLIGHTED PULL QUOTE */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto my-12 md:my-16"
            >
              <div className="relative pl-6 md:pl-8 border-l-2" style={{ borderColor: accentColor }}>
                <Quote className="w-7 h-7 mb-3 text-[var(--orchid)] opacity-80" />
                <p className="font-[var(--font-instrument-serif)] italic text-2xl sm:text-2.5xl md:text-3xl leading-[1.38] text-foreground">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </motion.div>
          )}

          {/* STORY PROSE BODY */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="max-w-3xl mx-auto mt-10 md:mt-14"
          >
            <div
              className={cn("reading-prose", readingMode && "reading-prose-large")}
              dangerouslySetInnerHTML={{
                __html: story.content || "",
              }}
            />
          </motion.div>

          {/* THANK YOU + SIGNATURE */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto mt-16 md:mt-24 pt-10 border-t border-[var(--border)] text-center"
          >
            <p className="font-[var(--font-instrument-serif)] italic text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto">
              Thank you for reading this far.
            </p>
            <p className="font-[var(--font-great-vibes)] text-3.5xl md:text-4.5xl gradient-logo mt-5">
              Bhavya
            </p>
          </motion.div>
        </article>

        {/* CONTINUE READING CARD */}
        {continueStory && !readingMode && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 md:mt-28">
            <div className="glass-card rounded-[24px] md:rounded-[32px] overflow-hidden border border-[var(--border)]">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative min-h-[220px] bg-[#09090c]">
                  {continueStory.coverImage ? (
                    <img
                      src={continueStory.coverImage}
                      alt={continueStory.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#160d16] via-[#09090c] to-[#0d161a]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60 hidden md:block" />
                </div>

                <div className="p-7 sm:p-9 md:p-12 flex flex-col justify-center">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-2 font-medium">
                    Continue Reading
                  </p>
                  <h3 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-foreground leading-snug">
                    {continueStory.title}
                  </h3>
                  {continueStory.excerpt && (
                    <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mt-2.5 line-clamp-2 leading-relaxed font-[var(--font-source-serif)]">
                      {continueStory.excerpt}
                    </p>
                  )}
                  <Link
                    href={`/stories/${continueStory.slug}`}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground mt-6 w-fit group font-[var(--font-grotesk)]"
                  >
                    <span className="underline-animate">Read next</span>
                    <ArrowRight className="w-4 h-4 text-[var(--orchid)] transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RELATED STORIES */}
        {related.length > 0 && !readingMode && (
          <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 md:mt-24">
            <div className="mb-7 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)] font-medium">
                More in {story.category}
              </p>
              <Link
                href="/stories"
                className="text-xs text-[var(--foreground-secondary)] hover:text-foreground font-[var(--font-grotesk)]"
              >
                Browse all →
              </Link>
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