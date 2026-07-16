"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Plus, Edit, Trash2, ExternalLink, FileText, BookOpen,
  BarChart3, PenSquare, Archive, Eye, EyeOff, Sparkles, ChevronRight,
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
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground/50">Manage your stories and writings.</p>
            </div>
            <Link href="/editor">
              <Button className="gap-2 rounded-2xl glass-strong border-primary/20 hover:bg-primary/10">
                <Plus className="w-4 h-4" />
                New Story
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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
                className="rounded-2xl p-5 glass-card elevation-1 hover:elevation-3 transition-all duration-500 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                  <motion.div
                    className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <ChevronRight className="w-3 h-3 text-primary/30" />
                  </motion.div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground/50 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            {(["all", "published", "drafts"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  filter === f
                    ? "glass text-primary border border-primary/20"
                    : "text-muted-foreground/50 hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl glass skeleton" />
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="text-xl font-medium text-muted-foreground/60">No stories yet</h3>
              <p className="text-sm text-muted-foreground/40">Create your first story to get started.</p>
              <Link href="/editor">
                <Button className="gap-2 rounded-2xl mt-4">
                  <Plus className="w-4 h-4" />
                  Write Your First Story
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story, i) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.4 }}
                  className="group rounded-2xl glass-card p-5 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            story.published ? "bg-success" : "bg-warning"
                          )}
                        />
                        <span className="text-xs text-muted-foreground/50">
                          {story.published ? "Published" : "Draft"}
                        </span>
                        <span className="text-xs text-muted-foreground/30">·</span>
                        <span className="text-xs text-muted-foreground/50">{story.category}</span>
                        <span className="text-xs text-muted-foreground/30">·</span>
                        <span className="text-xs text-muted-foreground/50">{story.wordCount} words</span>
                      </div>
                      <h3 className="text-base font-semibold text-foreground truncate">{story.title}</h3>
                      <p className="text-sm text-muted-foreground/50 truncate mt-0.5">
                        {story.excerpt || "No excerpt"}
                      </p>
                      <p className="text-xs text-muted-foreground/30 mt-1.5">{formatDate(story.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ActionButton href={`/stories/${story.slug}`} icon={<ExternalLink className="w-4 h-4" />} label="View" />
                      <ActionButton href={`/editor/${story.slug}`} icon={<Edit className="w-4 h-4" />} label="Edit" />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => togglePublish(story)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground/50 hover:text-foreground hover:glass transition-all"
                        title={story.published ? "Unpublish" : "Publish"}
                      >
                        {story.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteStory(story.slug)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
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

function ActionButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground/50 hover:text-foreground hover:glass transition-all"
        title={label}
      >
        {icon}
      </motion.div>
    </Link>
  )
}