"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus, Edit, Trash2, ExternalLink, FileText, BookOpen,
  PenSquare, Archive, Eye, EyeOff,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { cn, formatDate } from "@/lib/utils"
import type { Story } from "@/types"

export default function DashboardPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState({ totalStories: 0, published: 0, drafts: 0, totalWords: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "published" | "drafts">("all")

  const fetchData = async () => {
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
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  const deleteStory = async (slug: string) => {
    if (!confirm("Are you sure?")) return
    await fetch(`/api/stories/${slug}`, { method: "DELETE" })
    fetchData()
  }

  const togglePublish = async (story: Story) => {
    await fetch(`/api/stories/${story.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !story.published }),
    })
    fetchData()
  }

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <Navbar />
      <main className="pt-20 md:pt-20">
        <div className="max-w-6xl mx-auto px-6 py-10 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-[var(--font-serif)] text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your stories</p>
              </div>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl glass hover:bg-secondary transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Story
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
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
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="p-4 rounded-xl glass-card"
                >
                  <stat.icon className="w-4 h-4 text-muted-foreground mb-2" />
                  <div className="text-xl font-semibold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-6">
              {(["all", "published", "drafts"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-colors",
                    filter === f
                      ? "glass text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl skeleton border border-border/50" />
                ))}
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground/60">No stories yet</p>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground mt-3 underline-animate"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Write your first story
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stories.map((story, i) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="group p-4 rounded-xl glass-card hover:border-accent/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", story.published ? "bg-success" : "bg-warning")} />
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {story.published ? "Published" : "Draft"}
                          </span>
                          {story.category && (
                            <>
                              <span className="text-muted-foreground/40">&middot;</span>
                              <span className="text-[10px] text-muted-foreground">{story.category}</span>
                            </>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-foreground truncate">{story.title}</h3>
                        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                          {story.excerpt || "No excerpt"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 mt-1">{formatDate(story.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/stories/${story.slug}`}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
                          title="View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/editor/${story.slug}`}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => togglePublish(story)}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground hover:bg-secondary transition-colors"
                          title={story.published ? "Unpublish" : "Publish"}
                        >
                          {story.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => deleteStory(story.slug)}
                          className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}