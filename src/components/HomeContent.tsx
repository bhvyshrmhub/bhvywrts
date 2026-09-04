"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Feather, Moon } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import { Stars } from "./Stars"
import {
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  parseStoryTags,
  type CollectionType,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function SectionHeading({ eyebrow, title, link }: { eyebrow?: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7">
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
    <section className={cn("max-w-7xl mx-auto px-5 md:px-8 py-5 md:py-10", className)}>
      {children}
    </section>
  )
}

export function HomeContent() {
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
        if (data) setStories(data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const latestStory = stories[0] || null

  const featured = useMemo(
    () => stories.find((s) => s.featured && s.slug !== latestStory?.slug) || null,
    [stories, latestStory]
  )

  const recentStories = useMemo(() => {
    const taken = new Set<string>()
    if (latestStory) taken.add(latestStory.slug)
    if (featured) taken.add(featured.slug)
    return stories.filter((s) => !taken.has(s.slug)).slice(0, 6)
  }, [stories, latestStory, featured])

  const moreStories = useMemo(() => {
    const taken = new Set<string>()
    if (latestStory) taken.add(latestStory.slug)
    if (featured) taken.add(featured.slug)
    recentStories.forEach((s) => taken.add(s.slug))
    return stories.filter((s) => !taken.has(s.slug)).slice(0, 6)
  }, [stories, latestStory, featured, recentStories])

  const collections = useMemo(() => {
    const map = new Map<CollectionType, Story[]>()
    for (const story of stories) {
      const { collection } = parseStoryTags(story.tags)
      if (collection) {
        if (!map.has(collection)) map.set(collection, [])
        map.get(collection)!.push(story)
      }
    }
    return COLLECTIONS.filter((c) => map.has(c)).map((c) => ({ collection: c, stories: map.get(c)! }))
  }, [stories])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-10 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-3xl skeleton border border-[var(--border)]" />
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
        {/* ===== JOURNAL MASTHEAD — compact, story-first ===== */}
        <section className="relative pt-20 md:pt-32 pb-2">
          <Stars count={12} className="!absolute" />
          <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-sm md:text-base text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic max-w-md mx-auto">
                A digital journal of stories, thoughts and things left unsaid.
              </p>

              {/* Small atmospheric moon */}
              <div className="mt-5 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--border-strong)]" />
                <span
                  className="w-2.5 h-2.5 rounded-full animate-moon-glow"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #fff5f9 0%, #f5dde8 55%, #e8c4d5 100%)",
                    boxShadow: "0 0 14px rgba(255,182,217,0.3), 0 0 34px rgba(255,182,217,0.12)",
                  }}
                />
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--border-strong)]" />
              </div>
            </motion.div>
          </div>
        </section>

        {!latestStory ? (
          <Section>
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-5 flex items-center justify-center">
                <Feather className="w-5 h-5 text-[var(--muted)]" />
              </div>
              <p className="text-lg font-[var(--font-instrument-serif)] text-[var(--foreground-secondary)]">
                Nothing has been written here yet.
              </p>
              <p className="text-sm text-[var(--muted)] mt-2">
                The first page is still waiting for its first line.
              </p>
            </div>
          </Section>
        ) : (
          <>
            {/* ===== LATEST STORY — prominent, compact ===== */}
            <Section className="pt-2 md:pt-6">
              <SectionHeading
                eyebrow="Newest entry"
                title="Latest Story"
                link={{ href: "/stories", label: "All stories" }}
              />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <LatestStoryCard story={latestStory} />
              </motion.div>
            </Section>

            {/* ===== RECENT STORIES ===== */}
            {recentStories.length > 0 && (
              <Section>
                <SectionHeading eyebrow="Newly written" title="Recent Stories" link={{ href: "/stories", label: "View all" }} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {recentStories.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* ===== FEATURED STORY ===== */}
            {featured && (
              <Section>
                <SectionHeading eyebrow="Handpicked" title="Featured Story" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/stories/${featured.slug}`} className="group block">
                    <div
                      className="relative overflow-hidden rounded-[28px] border border-[var(--border)]"
                      style={{ boxShadow: "var(--card-hover-shadow)" }}
                    >
                      <div className="aspect-[16/9] md:aspect-[21/9] relative bg-[#0a0a0c]">
                        {featured.coverImage ? (
                          <img
                            src={featured.coverImage}
                            alt={featured.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#1a1018] via-[#0a0a0c] to-[#1a1020]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {featured.category && (
                              <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] border border-white/15 bg-black/30 text-white font-[var(--font-grotesk)]">
                                {featured.category}
                              </span>
                            )}
                            <span className="text-[11px] text-white/60 font-[var(--font-grotesk)]">
                              {featured.readingTime || 5} min read
                            </span>
                          </div>
                          <h2 className="text-2xl md:text-4xl text-white leading-[1.15] max-w-3xl">{featured.title}</h2>
                          {featured.excerpt && (
                            <p className="text-white/60 text-sm md:text-base mt-3 max-w-2xl line-clamp-2 leading-relaxed hidden md:block">
                              {featured.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-xs text-white mt-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
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

            {/* ===== COLLECTIONS ===== */}
            {collections.length > 0 && (
              <Section>
                <SectionHeading eyebrow="Worlds within the journal" title="Collections" link={{ href: "/collections", label: "All collections" }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {collections.slice(0, 6).map(({ collection, stories: colStories }, i) => {
                    const accent = COLLECTION_ACCENTS[collection]
                    return (
                      <motion.div
                        key={collection}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: (i % 3) * 0.08 }}
                      >
                        <Link href={`/collections/${encodeURIComponent(collection.toLowerCase())}`} className="group block h-full">
                          <div className="glass-card overflow-hidden h-full hover-lift" style={{ borderRadius: 28 }}>
                            <div className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0c]">
                              {colStories[0]?.coverImage ? (
                                <img
                                  src={colStories[0].coverImage}
                                  alt={collection}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                                />
                              ) : (
                                <div className="w-full h-full" style={{ background: `linear-gradient(140deg, ${accent}26, #0a0a0c 75%)` }} />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                              <div className="absolute top-4 left-5 flex items-center gap-2">
                                <Moon className="w-3.5 h-3.5" style={{ color: accent }} />
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-[var(--font-grotesk)]">
                                  Collection
                                </span>
                              </div>
                            </div>
                            <div className="p-5">
                              <h3 className="text-xl font-[var(--font-instrument-serif)] text-foreground leading-snug">{collection}</h3>
                              <p className="text-sm text-[var(--foreground-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                                {COLLECTION_DESCRIPTIONS[collection]}
                              </p>
                              <p className="text-xs text-[var(--muted)] mt-3 font-[var(--font-grotesk)]">
                                {colStories.length} {colStories.length === 1 ? "story" : "stories"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* ===== MORE STORIES ===== */}
            {moreStories.length > 0 && (
              <Section>
                <SectionHeading eyebrow="Keep reading" title="More Stories" link={{ href: "/stories", label: "Browse all" }} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {moreStories.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* ===== CLOSING ===== */}
            <Section className="pt-2 pb-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.9 }}
                className="text-center py-10"
              >
                <p className="font-[var(--font-instrument-serif)] italic text-xl md:text-2xl text-foreground leading-relaxed max-w-md mx-auto">
                  &ldquo;Thank you for reading.
                  <br />
                  These stories were written just for you.&rdquo;
                </p>
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] text-sm px-6 py-3 mt-8 text-[var(--foreground-secondary)] hover:text-foreground hover:border-[var(--border-strong)] transition-colors"
                >
                  <Feather className="w-4 h-4" />
                  Keep reading
                </Link>
              </motion.div>
            </Section>
          </>
        )}
      </main>
      <Footer />
      <FloatingWriteButton />
    </>
  )
}

function LatestStoryCard({ story }: { story: Story }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const tags = parseStoryTags(story.tags)
  const accent = tags.accent || "var(--lavender)"

  return (
    <Link href={`/stories/${story.slug}`} className="group block focus-visible:outline-none">
      <div
        className="glass-card overflow-hidden hover-lift"
        style={{ borderRadius: 28 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden bg-[#0a0a0c]">
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
                    "absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  style={tags.coverPos ? { objectPosition: `${tags.coverPos.x}% ${tags.coverPos.y}%` } : undefined}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(140deg, color-mix(in srgb, ${accent} 22%, #0a0a0c) 0%, #0a0a0c 70%)` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r" />
          </div>

          <div className="p-6 md:p-9 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.16em] border font-[var(--font-grotesk)]"
                style={{ color: accent, borderColor: `${accent}30`, background: `${accent}0d` }}
              >
                Newest entry
              </span>
              {story.category && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] font-[var(--font-grotesk)]">
                  {story.category}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-4xl text-foreground leading-[1.15]">{story.title}</h2>

            {story.excerpt && (
              <p className="text-sm md:text-[15px] text-[var(--foreground-secondary)] mt-3 leading-relaxed line-clamp-3">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
              <span>
                {new Date(story.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="w-0.5 h-0.5 rounded-full bg-[var(--muted)]" />
              <span>{story.readingTime || 5} min read</span>
            </div>

            <span className="inline-flex items-center gap-2 text-sm text-foreground mt-6 w-fit group-hover:opacity-90 transition-opacity">
              <span className="underline-animate">Read the story</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
