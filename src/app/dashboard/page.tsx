"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus, Edit, Trash2, ExternalLink, FileText, BookOpen,
  BarChart3, PenSquare, Archive, Eye, EyeOff,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { cn, formatDate } from "@/lib/utils"
import type { Story } from "@/types"

export default function DashboardPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState({ totalStories: 0, published: 0, drafts: 0, totalWords: 0, featured: 0 })
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
    if (!confirm("Are you sure you want to delete this story?")) return
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
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your stories and writings.</p>
            </div>
            <Link href="/editor">
              <Button className="gap-2 rounded-full">
                <Plus className="w-4 h-4" />
                New Story
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                className="rounded-2xl p-5 border border-border/30 bg-card/30 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-b border-border/30 pb-4">
            {(["all", "published", "drafts"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  filter === f
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-card/30 border border-border/30 animate-pulse" />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-medium text-muted-foreground">No stories yet</h3>
              <p className="text-sm text-muted-foreground/60">Create your first story to get started.</p>
              <Link href="/editor">
                <Button className="gap-2 rounded-full mt-2">
                  <Plus className="w-4 h-4" />
                  Write Your First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm p-5 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          story.published ? "bg-emerald-400" : "bg-amber-400"
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {story.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{story.category}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{story.wordCount} words</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground truncate">{story.title}</h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                        {story.excerpt || "No excerpt"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(story.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/stories/${story.slug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/editor/${story.slug}`}>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-8 h-8"
                        onClick={() => togglePublish(story)}
                      >
                        {story.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => deleteStory(story.slug)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
