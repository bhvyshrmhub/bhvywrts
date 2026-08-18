"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  BookOpen,
  PenSquare,
  Archive,
  Eye,
  EyeOff,
  BarChart3,
  Star,
  Sparkles,
  Feather,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { cn, formatDate } from "@/lib/utils"
import { parseStoryTags, buildTags } from "@/lib/constants"
import type { Story } from "@/types"

const CHANGELOG = [
  { version: "2.0", date: "2026", note: "Complete visual redesign. AMOLED theme, new typography, storytelling homepage, reading mode, collections & about pages, redesigned editor." },
  { version: "1.x", date: "2026", note: "Story editor, analytics, and the original journal experience." },
]

export default function DashboardPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState({ totalStories: 0, published: 0, drafts: 0, totalWords: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all")

  const fetchData = useCallback(async () => {
    const params = filter === "all" ? "?published=all" : `?published=${filter === "published"}`
    try {
      const [storiesRes, analyticsRes] = await Promise.all([
        fetch(`/api/stories${params}`),
        fetch("/api/analytics"),
      ])
      setStories(await storiesRes.json())
      setStats(await analyticsRes.json())
    } catch {}
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const patchStory = async (story: Story, body: Record<string, unknown>) => {
    await fetch(`/api/stories/${story.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    fetchData()
  }

  const deleteStory = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return
    await fetch(`/api/stories/${slug}`, { method: "DELETE" })
    fetchData()
  }

  const togglePublish = (story: Story) => patchStory(story, { published: !story.published })

  const toggleFlag = (story: Story, flag: "editorsPick" | "recommended") => {
    const tags = parseStoryTags(story.tags)
    const next = { ...tags, [flag]: !tags[flag] }
    patchStory(story, { tags: buildTags(next) })
  }

  const toggleFeatured = (story: Story) => patchStory(story, { featured: !story.featured })

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-28 md:pt-36">
        <div className="max-w-6xl mx-auto px-5 md:px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-2">
                  Admin
                </p>
                <h1 className="text-3xl md:text-4xl text-foreground">Dashboard</h1>
                <p className="text-sm text-[var(--foreground-secondary)] mt-1.5">Manage your journal</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/analytics" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:border-[var(--border-strong)] transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
                <Link href="/editor" className="inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-full bg-white text-black hover:bg-white/90 transition-colors">
                  <Plus className="w-4 h-4" />
                  New Story
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {[
                { label: "Total Stories", value: stats.totalStories, icon: FileText },
                { label: "Published", value: stats.published, icon: BookOpen },
                { label: "Drafts", value: stats.drafts, icon: Archive },
                { label: "Words Written", value: stats.totalWords.toLocaleString(), icon: PenSquare },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.6 }}
                  className="p-5 rounded-3xl glass-card"
                >
                  <stat.icon className="w-4 h-4 text-[var(--muted)] mb-3" />
                  <div className="text-2xl font-[var(--font-instrument-serif)] text-foreground">{stat.value}</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-[var(--font-grotesk)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 mb-6">
              {(["all", "published", "drafts"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs border transition-colors font-[var(--font-grotesk)]",
                    filter === f
                      ? "border-transparent bg-white text-black"
                      : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-strong)] hover:text-foreground"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl skeleton border border-[var(--border)]" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="w-10 h-10 text-[var(--muted)] mx-auto mb-4 opacity-40" />
                <p className="text-sm text-[var(--foreground-secondary)]">No stories yet</p>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground mt-4 underline-animate"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Write your first story
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stories.map((story, i) => {
                  const tags = parseStoryTags(story.tags)
                  return (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                      className="group p-5 rounded-2xl glass-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full", story.published ? "bg-success" : "bg-warning")} />
                            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-[var(--font-grotesk)]">
                              {story.published ? "Published" : "Draft"}
                            </span>
                            {story.featured && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--orchid)] font-[var(--font-grotesk)]">
                                <Sparkles className="w-3 h-3" /> Featured
                              </span>
                            )}
                            {tags.editorsPick && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--lavender)] font-[var(--font-grotesk)]">
                                <Star className="w-3 h-3" /> Editor&apos;s Pick
                              </span>
                            )}
                            {tags.recommended && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-[var(--soft-cyan)] font-[var(--font-grotesk)]">
                                <Feather className="w-3 h-3" /> Recommended
                              </span>
                            )}
                            {story.category && (
                              <>
                                <span className="text-[var(--muted)]/40">·</span>
                                <span className="text-[10px] text-[var(--muted)]">{story.category}</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-[var(--font-instrument-serif)] text-lg text-foreground truncate">
                            {story.title}
                          </h3>
                          <p className="text-xs text-[var(--muted)] truncate mt-1">
                            {story.excerpt || "No excerpt"}
                          </p>
                          <p className="text-[10px] text-[var(--muted)]/60 mt-1.5 font-[var(--font-grotesk)]">
                            {formatDate(story.createdAt)} · {story.readingTime || 5} min read
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-1 shrink-0 max-w-[200px]">
                          <IconBtn onClick={() => toggleFeatured(story)} active={story.featured} title={story.featured ? "Unfeature" : "Feature"} activeColor="text-[var(--orchid)]">
                            <Sparkles className="w-4 h-4" />
                          </IconBtn>
                          <IconBtn onClick={() => toggleFlag(story, "editorsPick")} active={!!tags.editorsPick} title={tags.editorsPick ? "Remove Editor's Pick" : "Mark as Editor's Pick"} activeColor="text-[var(--lavender)]">
                            <Star className="w-4 h-4" />
                          </IconBtn>
                          <IconBtn onClick={() => toggleFlag(story, "recommended")} active={!!tags.recommended} title={tags.recommended ? "Remove Recommended" : "Mark as Recommended"} activeColor="text-[var(--soft-cyan)]">
                            <Feather className="w-4 h-4" />
                          </IconBtn>
                          <div className="w-px h-5 bg-[var(--border)] mx-1" />
                          <Link href={`/stories/${story.slug}`} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors" title="View">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link href={`/editor/${story.slug}`} className="p-1.5 rounded-lg text-[var(--muted)] hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <IconBtn onClick={() => togglePublish(story)} title={story.published ? "Unpublish" : "Publish"}>
                            {story.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </IconBtn>
                          <button
                            onClick={() => deleteStory(story.slug)}
                            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Changelog */}
            <div className="mt-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-5">
                Changelog
              </p>
              <div className="glass-card rounded-3xl p-6">
                <div className="space-y-4">
                  {CHANGELOG.map((c) => (
                    <div key={c.version} className="flex gap-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-[var(--font-grotesk)] border border-[var(--orchid)]/30 text-[var(--lavender)] bg-[var(--orchid)]/10 h-fit whitespace-nowrap">
                        v{c.version}
                      </span>
                      <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                        <span className="text-[var(--muted)] font-[var(--font-grotesk)] mr-1.5">{c.date}</span>
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  active,
  activeColor,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  active?: boolean
  activeColor?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-lg transition-colors",
        active ? cn(activeColor, "bg-secondary") : "text-[var(--muted)] hover:text-foreground hover:bg-secondary"
      )}
    >
      {children}
    </button>
  )
}
