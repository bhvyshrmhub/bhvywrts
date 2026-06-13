"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, BookOpen, Calendar } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ParticleBackground } from "@/components/ParticleBackground"
import { ReadingProgress } from "@/components/ReadingProgress"
import { ScreenshotMode } from "@/components/ScreenshotMode"
import { formatDate } from "@/lib/utils"
import type { Story } from "@/types"

export default function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stories/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setStory(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 max-w-3xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card/30 rounded w-3/4" />
            <div className="h-4 bg-card/30 rounded w-1/2" />
            <div className="h-64 bg-card/30 rounded-2xl" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-card/30 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="relative min-h-screen">
        <ParticleBackground />
        <Navbar />
        <main className="relative z-10 pt-24 max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-muted-foreground">Story not found</h1>
          <Link href="/stories" className="text-accent hover:underline mt-4 inline-block">
            Back to stories
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <ReadingProgress />
      <ParticleBackground />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to stories
            </Link>
          </motion.div>

          {story.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden mb-10"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${story.coverImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </motion.div>
          )}

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 mb-12"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/20">
                {story.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
              {story.title}
            </h1>

            {story.subtitle && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                {story.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(story.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {story.readingTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {story.wordCount} words
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ScreenshotMode title={story.title} excerpt={story.excerpt || story.subtitle} />
            </div>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="prose prose-invert max-w-none
              prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
              prose-p:text-foreground/85 prose-p:leading-relaxed prose-p:text-lg
              prose-a:text-accent prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-card prose-pre:border prose-pre:border-border/50 prose-pre:rounded-2xl
              prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:pl-6 prose-blockquote:italic
              prose-img:rounded-2xl prose-img:shadow-lg
              prose-hr:border-border/30
              prose-li:text-foreground/85
              [&_p]:mb-6
              [&_h2]:mt-12 [&_h2]:mb-6
              [&_h3]:mt-8 [&_h3]:mb-4"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  )
}
