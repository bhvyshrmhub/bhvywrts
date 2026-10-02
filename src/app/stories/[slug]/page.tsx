"use client"

import { useState, useEffect, use, useMemo, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  Heart,
  Maximize2,
  Minimize2,
  ArrowRight,
  Feather,
  Lock,
  Eye,
  Loader2,
  Check,
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

const SKELETON_WIDTHS = ["82%", "94%", "68%", "90%", "74%", "86%", "62%", "88%", "72%"]

function ShareButton({
  title,
  slug,
  hero = false,
}: {
  title: string
  slug: string
  hero?: boolean
}) {
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

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share story"
      title={copied ? "Link copied!" : "Share story"}
      className={cn(
        "w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer",
        hero
          ? "border-white/20 bg-black/35 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/15 hover:border-white/35 active:scale-95"
          : "border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)] active:scale-95"
      )}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[var(--orchid)]" />
      ) : (
        <Share2 className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

function BookmarkButton({
  id,
  hero = false,
}: {
  id: string
  hero?: boolean
}) {
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
      title={bookmarked ? "Bookmarked" : "Bookmark"}
      className={cn(
        "w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer",
        hero
          ? bookmarked
            ? "border-[var(--orchid)]/60 text-[var(--orchid)] bg-[var(--orchid)]/20 shadow-[0_0_12px_rgba(232,121,249,0.25)]"
            : "border-white/20 bg-black/35 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/15 hover:border-white/35 active:scale-95"
          : bookmarked
            ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
            : "border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)] active:scale-95"
      )}
    >
      <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
    </button>
  )
}

function FavoriteButton({
  id,
  hero = false,
}: {
  id: string
  hero?: boolean
}) {
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
      title={fav ? "Favorited" : "Favorite"}
      className={cn(
        "w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer",
        hero
          ? fav
            ? "border-[var(--orchid)]/60 text-[var(--orchid)] bg-[var(--orchid)]/20 shadow-[0_0_12px_rgba(232,121,249,0.25)]"
            : "border-white/20 bg-black/35 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/15 hover:border-white/35 active:scale-95"
          : fav
            ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
            : "border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary hover:border-[var(--border-strong)] active:scale-95"
      )}
    >
      <Heart className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
    </button>
  )
}

// Preserved utility function as requested in requirements
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
    <div className="min-h-screen relative overflow-hidden bg-[var(--background)]">
      <Navbar />

      {/* Atmospheric Ambient Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full blur-[160px] opacity-[0.08]"
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
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[var(--foreground-secondary)] hover:text-foreground transition-colors mb-7 font-[var(--font-grotesk)]"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>All stories</span>
          </Link>

          {/* Locked Card */}
          <div className="glass-card rounded-[28px] md:rounded-[32px] p-8 md:p-11 text-center relative overflow-hidden border border-[var(--border)] shadow-xl">
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
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-3 font-medium">
              Private Story
            </p>

            {/* Title */}
            <h1 className="font-[var(--font-instrument-serif)] text-3xl md:text-3.5xl text-foreground leading-tight">
              {story.title || "This story is private"}
            </h1>

            {story.subtitle && (
              <p className="mt-2.5 text-sm text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic leading-relaxed">
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
                  "transition-all duration-300 shadow-sm cursor-pointer",
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

function StoryHero({
  story,
  tags,
  readingMode,
  onReadingMode,
}: {
  story: Story
  tags: ReturnType<typeof parseStoryTags>
  readingMode: boolean
  onReadingMode: () => void
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  // Subtle cinematic scroll motion
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.04])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.45])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 26])

  const moodColor = tags.mood ? MOOD_COLORS[tags.mood as Mood] : undefined
  const accentColor = tags.accent || moodColor || "var(--orchid)"

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden bg-[#050505] min-h-[500px] md:min-h-[560px] h-[54vh] max-h-[720px] flex flex-col justify-between"
    >
      {/* Background Image / Ambient Layer */}
      {story.coverImage ? (
        <motion.div
          initial={{ scale: 1.04, opacity: 0, filter: "blur(6px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            y: heroY,
          }}
          className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
        >
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}
          <img
            src={story.coverImage}
            alt={story.title}
            loading="eager"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-700",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            style={
              tags.coverPos
                ? { objectPosition: `${tags.coverPos.x}% ${tags.coverPos.y}%` }
                : undefined
            }
          />
        </motion.div>
      ) : (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, ${moodColor || "rgba(232,121,249,0.22)"} 0%, #050505 75%)`,
          }}
        />
      )}

      {/* Top subtle vignette for Navbar and Back link */}
      <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-[1]" />

      {/* Cinematic Bottom Gradient — transparent to deep #050505 */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.15) 30%, rgba(5,5,5,0.72) 70%, #050505 100%)",
        }}
      />

      {/* Back to stories minimal navigation */}
      <div className="max-w-[760px] mx-auto w-full px-5 sm:px-6 md:px-0 pt-20 md:pt-24 z-10 relative">
        <Link
          href="/stories"
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/75 hover:text-white transition-colors duration-200 font-[var(--font-grotesk)] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to stories</span>
        </Link>
      </div>

      {/* Story Identity Integrated into Image */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[760px] mx-auto w-full px-5 sm:px-6 md:px-0 pb-10 md:pb-14 z-10 relative mt-auto"
      >
        {/* Editorial Badges (Category, Mood, Collection) */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {story.category && (
            <span
              className="text-[10px] uppercase tracking-[0.18em] font-medium font-[var(--font-grotesk)] px-2.5 py-0.5 rounded-full border border-white/20 text-white/90 bg-white/10 backdrop-blur-sm"
              style={{
                borderColor: accentColor !== "var(--orchid)" ? `${accentColor}50` : undefined,
                color: accentColor !== "var(--orchid)" ? accentColor : undefined,
              }}
            >
              {story.category}
            </span>
          )}

          {tags.mood && (
            <span className="text-[10px] uppercase tracking-[0.18em] font-medium font-[var(--font-grotesk)] px-2.5 py-0.5 rounded-full border border-white/15 text-white/75 bg-black/30 backdrop-blur-sm">
              {tags.mood}
            </span>
          )}

          {tags.collection && (
            <Link
              href={`/collections/${encodeURIComponent(tags.collection.toLowerCase())}`}
              className="text-[10px] uppercase tracking-[0.18em] font-medium font-[var(--font-grotesk)] px-2.5 py-0.5 rounded-full border border-white/15 text-white/75 hover:text-white hover:border-white/35 bg-black/30 backdrop-blur-sm transition-colors"
            >
              {tags.collection}
            </Link>
          )}
        </div>

        {/* Large Editorial Serif Title */}
        <h1 className="font-[var(--font-instrument-serif)] text-[38px] sm:text-[46px] md:text-[56px] lg:text-[66px] leading-[1.08] text-white tracking-tight drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]">
          {story.title}
        </h1>

        {/* Subtitle */}
        {story.subtitle && (
          <p className="mt-3 md:mt-4 text-base sm:text-lg md:text-xl text-white/80 font-[var(--font-source-serif)] italic leading-relaxed max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
            {story.subtitle}
          </p>
        )}

        {/* Metadata & Action Controls Row */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-white/75 font-[var(--font-grotesk)]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 tracking-wide">
            <span>{formatDate(story.createdAt)}</span>
            <span className="text-white/40">·</span>
            <span>{story.readingTime || 5} min read</span>
            <span className="text-white/40">·</span>
            <span className="text-white/95">by Bhavya</span>
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton id={story.id} hero />
            <BookmarkButton id={story.id} hero />
            <ShareButton title={story.title} slug={story.slug} hero />
            {!readingMode && (
              <button
                type="button"
                onClick={onReadingMode}
                aria-label="Enter reading mode"
                title="Reading mode"
                className="w-9 h-9 rounded-full border border-white/20 bg-black/35 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/15 hover:border-white/35 flex items-center justify-center transition-all duration-200 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
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
  const [allStories, setAllStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
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

      // Fetch related stories by category
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

      // Fetch all published stories for previous/next navigation
      const { data: allStoriesData } = await supabase
        .from("Story")
        .select("id,slug,title,subtitle,category,coverImage,createdAt")
        .eq("published", true)
        .order("createdAt", { ascending: false })

      setAllStories(allStoriesData || [])
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

  // Derive Previous & Next stories
  const { prevStory, nextStory } = useMemo(() => {
    if (!allStories || allStories.length === 0 || !story) {
      return { prevStory: null, nextStory: null }
    }
    const index = allStories.findIndex((s) => s.slug === story.slug)
    if (index === -1) return { prevStory: null, nextStory: null }

    return {
      // Older story
      prevStory: index < allStories.length - 1 ? allStories[index + 1] : null,
      // Newer story
      nextStory: index > 0 ? allStories[index - 1] : null,
    }
  }, [allStories, story])

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
      <div className="min-h-screen bg-[var(--background)]">
        <ReadingProgress />
        <Navbar />
        {/* Cinematic Hero Skeleton */}
        <div className="w-full h-[50vh] min-h-[460px] skeleton relative" />
        <main className="max-w-[720px] mx-auto px-5 sm:px-6 md:px-0 py-16 space-y-4">
          <div className="h-6 skeleton rounded w-1/3 mb-6" />
          <div className="space-y-3 pt-2">
            {SKELETON_WIDTHS.map((w, i) => (
              <div key={i} className="h-4 skeleton rounded" style={{ width: w }} />
            ))}
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
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <main className="pt-36 max-w-2xl mx-auto px-6 py-20 text-center">
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-full"
            style={{
              boxShadow: "0 0 40px rgba(232, 121, 249, 0.15)",
            }}
          />
          <h1 className="text-3xl font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
            Story not found
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)] font-[var(--font-source-serif)]">
            The story you are looking for may have been moved or unpublished.
          </p>
          <Link
            href="/stories"
            className="text-xs uppercase tracking-[0.18em] text-[var(--orchid)] hover:opacity-80 mt-6 inline-block font-[var(--font-grotesk)] font-medium"
          >
            ← Back to stories
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen relative bg-[var(--background)]", readingMode && "reading-mode")}>
      <ReadingProgress />
      {!readingMode && <Navbar />}

      {/* Floating Reading Mode Toggle Pill */}
      <AnimatePresence>
        {readingMode && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="glass-strong rounded-full px-4 py-2 flex items-center gap-3 shadow-xl border border-[var(--border)]">
              <span className="text-[11px] text-[var(--foreground-secondary)] font-[var(--font-grotesk)] tracking-wider uppercase">
                Reading Mode
              </span>
              <button
                type="button"
                onClick={handleReadingMode}
                className="text-[11px] text-foreground hover:opacity-80 transition-opacity font-[var(--font-grotesk)] flex items-center gap-1.5 cursor-pointer font-medium"
                aria-label="Exit reading mode"
              >
                <Minimize2 className="w-3.5 h-3.5 text-[var(--orchid)]" />
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative">
        {/* CINEMATIC FULL-WIDTH HERO (Eliminated the large floating card!) */}
        {!readingMode ? (
          <StoryHero
            story={story}
            tags={tags}
            readingMode={readingMode}
            onReadingMode={handleReadingMode}
          />
        ) : (
          /* Clean Reading Mode Header */
          <header className="max-w-[720px] mx-auto px-5 sm:px-6 md:px-0 pt-24 pb-8 border-b border-[var(--border)]">
            <h1 className="font-[var(--font-instrument-serif)] text-3xl sm:text-4.5xl text-foreground leading-tight">
              {story.title}
            </h1>
            {story.subtitle && (
              <p className="mt-2 text-base text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic">
                {story.subtitle}
              </p>
            )}
            <div className="mt-4 text-xs text-[var(--muted)] font-[var(--font-grotesk)] flex items-center gap-2">
              <span>{formatDate(story.createdAt)}</span>
              <span>·</span>
              <span>{story.readingTime || 5} min read</span>
            </div>
          </header>
        )}

        {/* CLEAN READING SPACE & STORY CONTENT (No surrounding card!) */}
        <article className="max-w-[720px] mx-auto px-5 sm:px-6 md:px-0 pt-12 md:pt-16 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: readingMode ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={cn("reading-prose", readingMode && "reading-prose-large")}
              dangerouslySetInnerHTML={{
                __html: story.content || "",
              }}
            />
          </motion.div>

          {/* Minimal Editorial Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-16 md:mt-24 pt-10 border-t border-[var(--border)] text-center"
          >
            <p className="font-[var(--font-instrument-serif)] italic text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed max-w-md mx-auto">
              Thank you for reading this far.
            </p>
            <p className="font-[var(--font-great-vibes)] text-3.5xl md:text-4.5xl gradient-logo mt-4">
              Bhavya
            </p>
          </motion.div>

          {/* PREVIOUS / NEXT STORY NAVIGATION */}
          {(prevStory || nextStory) && !readingMode && (
            <nav
              aria-label="Story navigation"
              className="mt-14 md:mt-20 pt-10 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              {prevStory ? (
                <Link
                  href={`/stories/${prevStory.slug}`}
                  className="group flex flex-col items-start text-left focus-visible:outline-none"
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--orchid)] transition-colors font-[var(--font-grotesk)]">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                    Previous story
                  </span>
                  <span className="font-[var(--font-instrument-serif)] text-xl sm:text-2xl text-foreground group-hover:text-[var(--orchid)] transition-colors mt-2 line-clamp-2 leading-snug">
                    {prevStory.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextStory ? (
                <Link
                  href={`/stories/${nextStory.slug}`}
                  className="group flex flex-col items-start sm:items-end sm:text-right focus-visible:outline-none"
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-[var(--muted)] group-hover:text-[var(--orchid)] transition-colors font-[var(--font-grotesk)]">
                    Next story
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                  <span className="font-[var(--font-instrument-serif)] text-xl sm:text-2xl text-foreground group-hover:text-[var(--orchid)] transition-colors mt-2 line-clamp-2 leading-snug">
                    {nextStory.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </nav>
          )}
        </article>

        {/* CONTINUE READING CARD */}
        {continueStory && !readingMode && (
          <section className="max-w-4xl mx-auto px-5 sm:px-6 mt-12 md:mt-20">
            <div className="glass-card rounded-[28px] overflow-hidden border border-[var(--border)] group hover:border-[var(--border-strong)] transition-all">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative min-h-[220px] md:min-h-[260px] bg-[#09090c] overflow-hidden">
                  {continueStory.coverImage ? (
                    <img
                      src={continueStory.coverImage}
                      alt={continueStory.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#160d16] via-[#09090c] to-[#0d161a]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="p-7 sm:p-9 md:p-11 flex flex-col justify-center">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-2 font-medium">
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
                    <ArrowRight className="w-4 h-4 text-[var(--orchid)] transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RELATED STORIES */}
        {related.length > 0 && !readingMode && (
          <section className="max-w-5xl mx-auto px-5 sm:px-6 mt-16 md:mt-24 mb-16">
            <div className="mb-7 flex items-center justify-between border-b border-[var(--border)] pb-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--foreground-secondary)] font-[var(--font-grotesk)] font-medium">
                More in {story.category}
              </p>
              <Link
                href="/stories"
                className="text-xs text-[var(--muted)] hover:text-foreground transition-colors font-[var(--font-grotesk)]"
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