"use client"

import { useState, useEffect, use, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Clock, Calendar, Share2, Bookmark, Quote,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs glass hover:text-foreground transition-colors"
    >
      <Share2 className="w-3.5 h-3.5" />
      {copied ? "Copied!" : "Share"}
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
    const next = bookmarked
      ? saved.filter((s: string) => s !== id)
      : [...saved, id]
    localStorage.setItem("bhavy-bookmarks", JSON.stringify(next))
    setBookmarked(!bookmarked)
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
        bookmarked
          ? "glass text-accent"
          : "glass hover:text-foreground"
      )}
    >
      <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Saved" : "Save"}
    </button>
  )
}

function extractQuote(content: string): string | null {
  const text = content.replace(/<[^>]*>/g, "").trim()
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stories/${slug}`)
        const data = await res.json()
        setStory(data)

        // Track reading history
        try {
          const history: string[] = JSON.parse(localStorage.getItem("bhavy-reading-history") || "[]")
          const updated = [slug, ...history.filter((s: string) => s !== slug)].slice(0, 10)
          localStorage.setItem("bhavy-reading-history", JSON.stringify(updated))
        } catch {}

        if (data.category) {
          const { data: relatedData } = await supabase
            .from("Story")
            .select("*")
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

  const { mood } = useMemo(() => parseStoryTags(story?.tags || ""), [story?.tags])
  const moodColor = mood ? MOOD_COLORS[mood as Mood] : undefined

  const quote = useMemo(() => story?.content ? extractQuote(story.content) : null, [story?.content])

  if (loading) {
    return (
      <div className="min-h-screen">
        <ReadingProgress />
        <Navbar />
        <main className="pt-12 md:pt-16 max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-4">
            <div className="h-4 skeleton rounded w-1/4" />
            <div className="h-10 skeleton rounded w-3/4" />
            <div className="h-64 skeleton rounded-xl" />
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
        <main className="pt-12 md:pt-16 max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-[var(--font-serif)] text-muted-foreground/60">Story not found</h1>
          <Link href="/stories" className="text-sm text-muted-foreground hover:text-foreground mt-2 inline-block underline-animate">
            Back to stories
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-0 md:pt-16">
        {/* Hero Cover */}
        {story.coverImage ? (
          <div className="relative h-[45vh] md:h-[60vh] min-h-[350px] overflow-hidden">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={story.coverImage}
              alt={story.title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover animate-image-reveal",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <Stars count={30} />
          </div>
        ) : (
          <div
            className="relative h-[30vh] min-h-[200px] flex items-center justify-center"
            style={moodColor ? { background: `linear-gradient(135deg, ${moodColor}20, ${moodColor}05)` } : undefined}
          >
            <div
              className={!moodColor ? "gradient-bg absolute inset-0" : "absolute inset-0"}
            />
            <Stars count={30} />
            <div
              className="w-16 h-16 rounded-full moon-glow animate-moon-glow"
              style={moodColor ? { boxShadow: `0 0 60px ${moodColor}40, 0 0 120px ${moodColor}20` } : undefined}
            />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-6 -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 glass px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to stories
            </Link>
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            {!story.coverImage && <div className="h-8" />}
            <div className="flex items-center gap-3 mb-3">
              {story.category && (
                <span className="inline-block text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: moodColor || "var(--accent)" }}>
                  {story.category}
                </span>
              )}
              {mood && (
                <span className="text-[10px] glass px-2 py-0.5 rounded uppercase tracking-wider" style={{ color: moodColor, borderColor: `${moodColor}40` }}>
                  {mood}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-[var(--font-serif)] text-foreground leading-tight mb-4">
              {story.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(story.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {story.readingTime || "5"} min read
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <ShareButton title={story.title} slug={story.slug} />
                <BookmarkButton id={story.id} />
              </div>
            </div>
          </motion.header>

          {/* Highlighted Quote */}
          {quote && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="glass-strong rounded-2xl p-6 md:p-8 mb-10 text-center"
              style={moodColor ? { borderColor: `${moodColor}30` } : undefined}
            >
              <Quote className="w-5 h-5 mx-auto mb-3" style={{ color: moodColor || "var(--accent)" }} />
              <p className="text-lg md:text-xl font-[var(--font-serif)] italic text-foreground/90 leading-relaxed">
                &ldquo;{quote}&rdquo;
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-invert max-w-none
              prose-headings:font-[var(--font-serif)] prose-headings:text-foreground prose-headings:leading-tight
              prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:glass prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:glass-card prose-pre:rounded-xl
              prose-blockquote:border-l-2 prose-blockquote:border-accent/30 prose-blockquote:text-muted-foreground prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-xl prose-img:shadow-lg
              prose-hr:border-border/50
              prose-li:text-foreground/80
              [&_p]:mb-6
              [&_h2]:mt-12 [&_h2]:mb-6
              [&_h3]:mt-8 [&_h3]:mb-4"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          {/* Handwritten Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 pt-8 border-t border-border/50 text-right"
          >
            <p className="font-[var(--font-brand)] text-lg md:text-xl text-accent">
              &mdash; Bhavya
            </p>
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-4">
            <div className="flex items-center gap-2">
              <ShareButton title={story.title} slug={story.slug} />
              <BookmarkButton id={story.id} />
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12 md:py-16 border-t border-border/50 mt-12">
            <h2 className="text-2xl font-[var(--font-serif)] text-foreground mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((relatedStory) => (
                <Link key={relatedStory.id} href={`/stories/${relatedStory.slug}`} className="group block">
                  <div
                    className="glass-card overflow-hidden hover-lift"
                    style={{ borderRadius: 28 }}
                  >
                    <div className="aspect-[16/9] bg-secondary overflow-hidden">
                      {relatedStory.coverImage ? (
                        <img src={relatedStory.coverImage} alt={relatedStory.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.05]" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-pink-900/20">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 moon-glow" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-[var(--font-serif)] text-foreground group-hover:text-accent transition-colors leading-snug">{relatedStory.title}</h3>
                      <p className="text-xs text-muted-foreground/60 mt-1.5">{relatedStory.readingTime || "5"} min read</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </div>
  )
}
