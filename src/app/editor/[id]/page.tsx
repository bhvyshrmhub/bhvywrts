"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Check } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { TipTapEditor } from "@/components/TipTapEditor"
import { CoverImageUpload } from "@/components/CoverImageUpload"
import { useEditorStore } from "@/lib/store"
import { calculateReadingTime, calculateWords } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"
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
  const [coverImage, setCoverImage] = useState<string | null>(null)
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
        setCoverImage(data.coverImage || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const saveStory = async (publish: boolean) => {
    if (!title.trim() || !story) return
    setSaving(true)
    const wordCount = calculateWords(content)
    const excerpt = content.replace(/<[^>]*>/g, "").slice(0, 200)

    try {
      const res = await fetch(`/api/stories/${story.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          content,
          excerpt,
          category,
          coverImage,
          wordCount,
          readingTime: calculateReadingTime(content),
          published: publish,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error("Failed to update story:", err.error)
        return
      }
    } catch (e) {
      console.error("Failed to update story:", e)
    }
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
        <main className="relative pt-14 md:pt-16 max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="h-4 skeleton rounded w-1/4" />
            <div className="h-10 skeleton rounded w-3/4" />
            <div className="h-64 skeleton rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative pt-14 md:pt-16 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6 pt-6"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>

            <div className="flex items-center gap-1.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] transition-colors",
                    mode === m.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <div className={cn("space-y-4 mb-6", mode === "focus" && "max-w-3xl mx-auto")}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story Title..."
                  className="w-full text-2xl sm:text-3xl font-[var(--font-serif)] bg-transparent border-none outline-none placeholder:text-muted-foreground/20 text-foreground"
                />
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Add a subtitle..."
                  className="w-full text-base bg-transparent border-none outline-none placeholder:text-muted-foreground/20 text-muted-foreground/80"
                />
              </div>
            </div>
            <div>
              <CoverImageUpload currentImage={coverImage} onImageChange={setCoverImage} />
            </div>
          </div>

          <TipTapEditor content={content} onChange={setContent} />

          <div className={cn("fixed bottom-0 left-0 right-0 z-40", mode === "fullscreen" && "hidden")}>
            <div className="border-t border-border bg-background">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                  <span>{metrics.words} words</span>
                  <span className="hidden sm:inline">{metrics.characters} chars</span>
                  <span className="hidden sm:inline">{metrics.paragraphs} paragraphs</span>
                  <span>{metrics.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-8 text-xs rounded-lg bg-secondary text-secondary-foreground border border-border outline-none appearance-none cursor-pointer px-2"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => saveStory(false)}
                    disabled={saving || !title.trim()}
                    className="h-8 px-3 text-xs rounded-lg text-muted-foreground hover:text-foreground border border-border hover:bg-secondary transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Draft</span>
                  </button>
                  <button
                    onClick={() => saveStory(true)}
                    disabled={saving || !title.trim()}
                    className="h-8 px-3 text-xs rounded-lg bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Publish</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}