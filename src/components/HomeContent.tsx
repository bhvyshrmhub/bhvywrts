"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Feather, Moon, Sparkles, BookOpen } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

const CinematicIntro = dynamic(
  () => import("./CinematicIntro").then((mod) => mod.CinematicIntro),
  { ssr: false }
)
import { StoryCard } from "./StoryCard"
import { FloatingWriteButton } from "./FloatingWriteButton"
import {
  COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_ACCENTS,
  parseStoryTags,
  type CollectionType,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string
  title: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-7 md:mb-9">
      <div>
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--orchid)] font-[var(--font-grotesk)] mb-2 font-medium">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl md:text-3.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight">
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors group font-[var(--font-grotesk)]"
        >
          {link.label}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[var(--orchid)]" />
        </Link>
      )}
    </div>
  )
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10", className)}>
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
    return COLLECTIONS.filter((c) => map.has(c)).map((c) => ({
      collection: c,
      stories: map.get(c)!,
    }))
  }, [stories])

  return (
    <>
      <CinematicIntro coverImage={latestStory?.coverImage || featured?.coverImage} />
      <Navbar />
      {loading ? (
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-12 space-y-5">
            <div className="h-16 w-1/3 mx-auto skeleton rounded-full mb-8" />
            <div className="h-80 rounded-[24px] skeleton border border-[var(--border)]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-[22px] skeleton border border-[var(--border)]" />
              ))}
            </div>
          </div>
        </main>
      ) : (
        <main className="min-h-screen relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full blur-[140px] opacity-[0.07]"
            style={{
              background: "radial-gradient(circle, #e879f9 0%, #a855f7 50%, transparent 70%)",
            }}
          />
        </div>

        {/* ===== CINEMATIC MASTHEAD ===== */}
        <section className="relative z-10 pt-24 md:pt-36 pb-6 md:pb-10">
          <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.24em] border border-[var(--border-strong)] bg-secondary/60 text-[var(--foreground-secondary)] font-[var(--font-grotesk)] mb-5">
                <Sparkles className="w-3 h-3 text-[var(--orchid)]" />
                Digital Journal &amp; Essays
              </span>

              <h1 className="text-3xl sm:text-4xl md:text-5.5xl text-foreground font-[var(--font-instrument-serif)] tracking-tight leading-[1.12]">
                A quieter corner on the internet.
              </h1>

              <p className="text-sm md:text-base text-[var(--foreground-secondary)] font-[var(--font-source-serif)] italic max-w-lg mx-auto mt-4 leading-relaxed">
                Stories, thoughts and things left unsaid. Written in quiet hours.
              </p>

              {/* Atmospheric Moon Divider */}
              <div className="mt-7 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--border-strong)]" />
                <span
                  className="w-2.5 h-2.5 rounded-full animate-moon-glow"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #fff5f9 0%, #f5dde8 55%, #e8c4d5 100%)",
                    boxShadow: "0 0 16px rgba(232, 121, 249, 0.35), 0 0 36px rgba(232, 121, 249, 0.15)",
                  }}
                />
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--border-strong)]" />
              </div>
            </motion.div>
          </div>
        </section>

        {!latestStory ? (
          <Section className="relative z-10">
            <div className="text-center py-24 glass-card rounded-[28px] max-w-md mx-auto p-8">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Feather className="w-5 h-5 text-[var(--orchid)]" />
              </div>
              <p className="text-xl font-[var(--font-instrument-serif)] text-foreground">
                Nothing has been written here yet.
              </p>
              <p className="text-xs text-[var(--muted)] mt-2">
                The first page is still waiting for its first line.
              </p>
            </div>
          </Section>
        ) : (
          <div className="relative z-10 space-y-6 md:space-y-12 pb-16">
            {/* ===== LATEST ENTRY (HERO CARD) ===== */}
            <Section className="pt-0">
              <SectionHeading
                eyebrow="Newest entry"
                title="Latest Story"
                link={{ href: "/stories", label: "All stories" }}
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <LatestStoryCard story={latestStory} />
              </motion.div>
            </Section>

            {/* ===== RECENT STORIES ===== */}
            {recentStories.length > 0 && (
              <Section>
                <SectionHeading
                  eyebrow="Newly written"
                  title="Recent Stories"
                  link={{ href: "/stories", label: "View all" }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {recentStories.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* ===== FEATURED STORY (CINEMATIC PANORAMIC BANNER) ===== */}
            {featured && (
              <Section>
                <SectionHeading eyebrow="Handpicked" title="Featured Story" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/stories/${featured.slug}`} className="group block focus-visible:outline-none">
                    <div
                      className="relative overflow-hidden rounded-[24px] md:rounded-[28px] border border-[var(--border)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-[var(--border-strong)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
                    >
                      <div className="aspect-[16/9] md:aspect-[21/9] relative bg-[#09090c]">
                        {featured.coverImage ? (
                          <img
                            src={featured.coverImage}
                            alt={featured.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#160d16] via-[#09090c] to-[#120d18]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-12">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {featured.category && (
                              <span className="px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] border border-white/20 bg-black/40 text-white font-[var(--font-grotesk)] backdrop-blur-md">
                                {featured.category}
                              </span>
                            )}
                            <span className="text-[11px] text-white/70 font-[var(--font-grotesk)]">
                              {featured.readingTime || 5} min read
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl text-white font-[var(--font-instrument-serif)] leading-[1.14] max-w-3xl">
                            {featured.title}
                          </h2>
                          {featured.excerpt && (
                            <p className="text-white/75 text-sm md:text-base mt-3 max-w-2xl line-clamp-2 leading-relaxed font-[var(--font-source-serif)] hidden sm:block">
                              {featured.excerpt}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-white mt-5 transition-transform duration-300 group-hover:translate-x-1 font-[var(--font-grotesk)]">
                            <span>Read the story</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--orchid)]" />
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
                <SectionHeading
                  eyebrow="Worlds within the journal"
                  title="Collections"
                  link={{ href: "/collections", label: "All collections" }}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {collections.slice(0, 6).map(({ collection, stories: colStories }, i) => {
                    const accent = COLLECTION_ACCENTS[collection] || "#e879f9"
                    return (
                      <motion.div
                        key={collection}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                      >
                        <Link href={`/collections/${encodeURIComponent(collection.toLowerCase())}`} className="group block h-full">
                          <div className="glass-card overflow-hidden h-full hover-lift rounded-[22px] md:rounded-[26px]">
                            <div className="relative aspect-[16/10] overflow-hidden bg-[#09090c]">
                              {colStories[0]?.coverImage ? (
                                <img
                                  src={colStories[0].coverImage}
                                  alt={collection}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                                />
                              ) : (
                                <div className="w-full h-full" style={{ background: `linear-gradient(140deg, ${accent}26, #09090c 75%)` }} />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                              <div className="absolute top-4 left-4 flex items-center gap-2">
                                <Moon className="w-3.5 h-3.5" style={{ color: accent }} />
                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-[var(--font-grotesk)]">
                                  Collection
                                </span>
                              </div>
                            </div>
                            <div className="p-5 md:p-6">
                              <h3 className="text-xl font-[var(--font-instrument-serif)] text-foreground leading-snug">
                                {collection}
                              </h3>
                              <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                                {COLLECTION_DESCRIPTIONS[collection]}
                              </p>
                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                                <span className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                                  {colStories.length} {colStories.length === 1 ? "story" : "stories"}
                                </span>
                                <span className="text-[11px] text-[var(--orchid)] font-medium font-[var(--font-grotesk)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                  Explore <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
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
                <SectionHeading
                  eyebrow="Keep reading"
                  title="More Stories"
                  link={{ href: "/stories", label: "Browse all" }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {moreStories.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* ===== CLOSING THOUGHT ===== */}
            <Section className="pt-6 pb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8 }}
                className="text-center py-12 px-6 rounded-[28px] glass-card max-w-2xl mx-auto"
              >
                <p className="font-[var(--font-instrument-serif)] italic text-xl md:text-2.5xl text-foreground leading-relaxed">
                  &ldquo;Thank you for reading.
                  <br />
                  These stories were written just for you.&rdquo;
                </p>
                <Link
                  href="/stories"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] text-xs md:text-sm px-6 py-3 mt-7 text-foreground hover:bg-secondary transition-all font-[var(--font-grotesk)]"
                >
                  <BookOpen className="w-4 h-4 text-[var(--orchid)]" />
                  Explore all stories
                </Link>
              </motion.div>
            </Section>
          </div>
        )}
      </main>
      )}
      <Footer />
      <FloatingWriteButton />
    </>
  )
}

function LatestStoryCard({ story }: { story: Story }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const tags = parseStoryTags(story.tags)
  const accent = tags.accent || "var(--orchid)"

  return (
    <Link href={`/stories/${story.slug}`} className="group block focus-visible:outline-none">
      <div
        className="glass-card overflow-hidden hover-lift rounded-[22px] md:rounded-[28px] border border-[var(--border)] group-hover:border-[var(--border-strong)]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Cover Image Container */}
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[360px] overflow-hidden bg-[#09090c]">
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
                    "absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  style={tags.coverPos ? { objectPosition: `${tags.coverPos.x}% ${tags.coverPos.y}%` } : undefined}
                />
              </>
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(140deg, color-mix(in srgb, ${accent} 22%, #09090c) 0%, #09090c 70%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-black/60" />
          </div>

          {/* Editorial Content */}
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.18em] border font-[var(--font-grotesk)] font-medium"
                style={{ color: accent, borderColor: `${accent}40`, background: `${accent}14` }}
              >
                Newest entry
              </span>
              {story.category && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] font-[var(--font-grotesk)]">
                  {story.category}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl text-foreground font-[var(--font-instrument-serif)] leading-[1.14]">
              {story.title}
            </h2>

            {story.excerpt && (
              <p className="text-xs sm:text-sm md:text-[15px] text-[var(--foreground-secondary)] mt-3.5 leading-relaxed line-clamp-3 font-[var(--font-source-serif)]">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
              <span>
                {new Date(story.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="w-1 h-1 rounded-full bg-[var(--muted)]/50" />
              <span>{story.readingTime || 5} min read</span>
            </div>

            <div className="mt-7 pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground group-hover:text-[var(--orchid)] transition-colors font-[var(--font-grotesk)]">
                <span>Read the story</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
