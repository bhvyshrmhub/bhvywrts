"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { SearchBar } from "./SearchBar"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { ReadingProgress } from "./ReadingProgress"
import { ArrowRight, TrendingUp, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

interface Story {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  coverImage: string | null
  category: string | null
  createdAt: string
  author: string | null
  readingTime: string | null
}

export function HomeContent() {
  const [stories, setStories] = useState<Story[]>([])
  const [featured, setFeatured] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from("Story")
          .select("*")
          .order("createdAt", { ascending: false })

        if (data) {
          const processed = data.map((s: any) => ({
            ...s,
            readingTime: s.readingTime || (s.content
              ? Math.max(1, Math.ceil(s.content.split(/\s+/).length / 200)) + " min read"
              : "5 min read"),
          }))
          setStories(processed)
          if (processed.length > 0) setFeatured(processed[0])
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const categories = [...new Set(stories.map(s => s.category).filter(Boolean))] as string[]
  const latest = stories.slice(1, 7)
  const editorsPicks = stories.filter(s => s.category === "Poetry" || s.category === "Philosophy").slice(0, 3)

  if (loading) {
    return (
      <>
        <Navbar />
        <ReadingProgress />
        <main className="min-h-screen pt-16 pb-16 md:pb-0">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg skeleton mb-6" />
            ))}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <ReadingProgress />
      <main className="min-h-screen pt-0 md:pt-16 pb-16 md:pb-0">
        {featured && (
          <section className="relative border-b border-border">
            <Link href={`/stories/${featured.slug}`} className="group block">
              <div className="relative h-[50vh] md:h-[70vh] min-h-[400px] overflow-hidden bg-secondary">
                {featured.coverImage ? (
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-6xl mx-auto">
                <div className="max-w-2xl">
                  {featured.category && (
                    <span className="inline-block text-[11px] font-medium text-accent uppercase tracking-widest mb-3">
                      {featured.category}
                    </span>
                  )}
                  <h1 className="text-3xl md:text-5xl font-[var(--font-serif)] text-foreground leading-tight mb-3">
                    {featured.title}
                  </h1>
                  {featured.excerpt && (
                    <p className="text-sm md:text-base text-muted-foreground max-w-xl line-clamp-2 leading-relaxed">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-xs text-muted-foreground">
                      {new Date(featured.createdAt).toLocaleDateString("en-US", {
                        month: "long", day: "numeric", year: "numeric"
                      })}
                    </span>
                    <span className="text-xs text-muted-foreground/50">&middot;</span>
                    <span className="text-xs text-muted-foreground">{featured.readingTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-[var(--font-serif)] text-foreground">Latest Stories</h2>
            <Link
              href="/stories"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latest.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>

        {editorsPicks.length > 0 && (
          <section className="border-t border-border">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <div className="flex items-center gap-2 mb-8">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-xl font-[var(--font-serif)] text-foreground">Editor&apos;s Picks</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editorsPicks.map((story, i) => (
                  <StoryCard key={story.id} story={story} index={i} />
                ))}
              </div>
            </div>
          </section>
        )}

        {categories.length > 0 && (
          <section className="border-t border-border">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
              <h2 className="text-xl font-[var(--font-serif)] text-foreground mb-8">Browse by Category</h2>
              <div className="flex flex-wrap gap-2" ref={categoriesRef}>
                {categories.map((cat, i) => (
                  <Link
                    key={cat}
                    href={`/stories?category=${encodeURIComponent(cat)}`}
                    className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-border transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {stories.length === 0 && !loading && (
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <p className="text-muted-foreground">No stories yet.</p>
          </div>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </>
  )
}