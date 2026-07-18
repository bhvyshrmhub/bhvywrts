"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft, Clock, Calendar, Share2, Bookmark,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { FloatingWriteButton } from "@/components/FloatingWriteButton"
import { formatDate, cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
          ? "text-accent bg-accent/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Saved" : "Save"}
    </button>
  )
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

  if (loading) {
    return (
      <div className="min-h-screen">
        <ReadingProgress />
        <Navbar />
        <main className="pt-14 md:pt-16 pb-16 md:pb-0 max-w-3xl mx-auto px-6 py-10">
          <div className="space-y-4">
            <div className="h-4 skeleton rounded w-1/4" />
            <div className="h-10 skeleton rounded w-3/4" />
            <div className="h-64 skeleton rounded-lg" />
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
        <main className="pt-14 md:pt-16 pb-16 md:pb-0 max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-[var(--font-serif)] text-muted-foreground/60">Story not found</h1>
          <Link href="/stories" className="text-sm text-muted-foreground hover:text-foreground mt-2 inline-block underline-animate">
            Back to library
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-0 md:pt-16 pb-16 md:pb-0">
        {story.coverImage && (
          <div className="relative h-[40vh] md:h-[55vh] min-h-[300px] overflow-hidden bg-secondary">
            {!imageLoaded && <div className="absolute inset-0 skeleton" />}
            <img
              src={story.coverImage}
              alt={story.title}
              onLoad={() => setImageLoaded(true)}
              className={cn(
                "w-full h-full object-cover animate-image-reveal",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>
        )}

        <article className="max-w-3xl mx-auto px-6 -mt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/stories"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to library
            </Link>
          </motion.div>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            {!story.coverImage && <div className="h-8" />}
            {story.category && (
              <span className="inline-block text-[11px] font-medium text-accent uppercase tracking-widest mb-3">
                {story.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] text-foreground leading-tight mb-3">
              {story.title}
            </h1>
            {story.excerpt && (
              <p className="text-base text-muted-foreground leading-relaxed">
                {story.excerpt}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-[var(--font-serif)] prose-headings:text-foreground prose-headings:leading-tight
              prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-card prose-pre:border prose-pre:border-border prose-pre:rounded-lg
              prose-blockquote:border-l-2 prose-blockquote:border-accent/30 prose-blockquote:text-muted-foreground prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-lg prose-img:shadow-lg
              prose-hr:border-border
              prose-li:text-foreground/80
              [&_p]:mb-6
              [&_h2]:mt-12 [&_h2]:mb-6
              [&_h3]:mt-8 [&_h3]:mb-4"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <ShareButton title={story.title} slug={story.slug} />
              <BookmarkButton id={story.id} />
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-12 md:py-16 border-t border-border mt-12">
            <h2 className="text-xl font-[var(--font-serif)] text-foreground mb-6">Related Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((relatedStory) => (
                <Link key={relatedStory.id} href={`/stories/${relatedStory.slug}`} className="group block hover-lift rounded-lg overflow-hidden bg-card border border-border">
                  <div className="aspect-[16/9] bg-secondary overflow-hidden">
                    {relatedStory.coverImage ? (
                      <img src={relatedStory.coverImage} alt={relatedStory.title} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-[var(--font-serif)] text-foreground group-hover:text-accent transition-colors">{relatedStory.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{relatedStory.readingTime || "5"} min read</p>
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