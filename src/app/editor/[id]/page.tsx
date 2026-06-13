"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Eye, Check, X } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { TipTapEditor } from "@/components/TipTapEditor"
import { useEditorStore } from "@/lib/store"
import { calculateReadingTime, calculateWords } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Story } from "@/types"

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { metrics, mode, setMode } = useEditorStore()
  const [story, setStory] = useState<Story | null>(null)
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [category, setCategory] = useState("Thoughts")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setStory(data)
        setTitle(data.title)
        setSubtitle(data.subtitle)
        setCategory(data.category)
        setContent(data.content)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const saveStory = async (publish: boolean) => {
    if (!title.trim() || !story) return
    setSaving(true)
    const wordCount = calculateWords(content)
    const excerpt = content.replace(/<[^>]*>/g, "").slice(0, 200)

    await fetch(`/api/stories/${story.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        subtitle,
        content,
        excerpt,
        category,
        wordCount,
        readingTime: calculateReadingTime(content),
        published: publish,
      }),
    })
    setSaving(false)
  }

  const modes = [
    { id: "normal" as const, label: "Normal" },
    { id: "focus" as const, label: "Focus" },
    { id: "typewriter" as const, label: "Typewriter" },
    { id: "zen" as const, label: "Zen" },
    { id: "fullscreen" as const, label: "Fullscreen" },
  ]

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <main className="relative z-10 pt-20 max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card/30 rounded w-1/4" />
            <div className="h-10 bg-card/30 rounded w-3/4" />
            <div className="h-6 bg-card/30 rounded w-1/2" />
            <div className="h-96 bg-card/30 rounded-2xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs transition-all",
                    mode === m.id
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className={cn("space-y-4 mb-6", mode === "focus" && "max-w-3xl mx-auto")}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story Title..."
              className="text-2xl sm:text-3xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30"
            />
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Add a subtitle..."
              className="text-base border-none bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30 text-muted-foreground"
            />
          </div>

          <TipTapEditor content={content} onChange={setContent} />

          <div className={cn(
            "fixed bottom-0 left-0 right-0 border-t border-border/30 bg-background/80 backdrop-blur-xl z-40",
            mode === "fullscreen" && "hidden"
          )}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{metrics.words} words</span>
                <span>{metrics.characters} chars</span>
                <span>{metrics.paragraphs} paragraphs</span>
                <span>{metrics.readingTime} min read</span>
              </div>

              <div className="flex items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-xs rounded-full w-[130px] border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => saveStory(story?.published ?? false)}
                  disabled={saving || !title.trim()}
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-8 text-xs gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save
                </Button>
                <Button
                  onClick={() => saveStory(true)}
                  disabled={saving || !title.trim()}
                  size="sm"
                  className="rounded-full h-8 text-xs gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Publish
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
