"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Check } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { TipTapEditor } from "@/components/TipTapEditor"
import { CoverImageUpload } from "@/components/CoverImageUpload"
import { useEditorStore } from "@/lib/store"
import { slugify, calculateReadingTime, calculateWords } from "@/lib/utils"
import { CATEGORIES, MOODS, COLLECTIONS, buildTags, type Mood, type CollectionType } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function NewStoryPage() {
  const router = useRouter()
  const { metrics, mode, setMode } = useEditorStore()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [category, setCategory] = useState("Thoughts")
  const [mood, setMood] = useState<Mood | "">("")
  const [collection, setCollection] = useState<CollectionType | "">("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const saveStory = async (publish: boolean) => {
    if (!title.trim()) return
    setSaving(true)
    const slug = slugify(title)
    const wordCount = calculateWords(content)
    const excerpt = content.replace(/<[^>]*>/g, "").slice(0, 200)
    const generatedSlug = `${slug}-${Date.now()}`
    const tags = buildTags(mood || null, collection || null, null)

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, subtitle, slug: generatedSlug, content, excerpt,
          category, coverImage, wordCount, tags,
          readingTime: calculateReadingTime(content),
          published: publish,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        console.error("Failed to save story:", err.error)
        return
      }
      router.push(`/editor/${generatedSlug}`)
    } catch (e) {
      console.error("Failed to save story:", e)
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

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative pt-12 md:pt-16 pb-24">
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
              Back
            </Link>

            <div className="flex items-center gap-1.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-2.5 py-1 rounded text-[11px] transition-colors",
                    mode === m.id
                      ? "glass text-foreground"
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn("fixed bottom-0 left-0 right-0 z-40", mode === "fullscreen" && "hidden")}
          >
            <div className="glass-strong border-t border-glass-border">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                  <span>{metrics.words} words</span>
                  <span className="hidden sm:inline">{metrics.characters} chars</span>
                  <span className="hidden sm:inline">{metrics.paragraphs} paragraphs</span>
                  <span>{metrics.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as Mood | "")}
                    className="h-8 text-xs rounded-lg bg-secondary text-secondary-foreground border border-border outline-none appearance-none cursor-pointer px-2"
                  >
                    <option value="">Mood</option>
                    {MOODS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={collection}
                    onChange={(e) => setCollection(e.target.value as CollectionType | "")}
                    className="h-8 text-xs rounded-lg bg-secondary text-secondary-foreground border border-border outline-none appearance-none cursor-pointer px-2"
                  >
                    <option value="">Collection</option>
                    {COLLECTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                    className="h-8 px-3 text-xs rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Publish</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
