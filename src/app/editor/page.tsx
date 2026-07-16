"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Eye, Check, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { TipTapEditor } from "@/components/TipTapEditor"
import { useEditorStore } from "@/lib/store"
import { slugify, calculateReadingTime, calculateWords } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function NewStoryPage() {
  const router = useRouter()
  const { metrics, mode, setMode } = useEditorStore()
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [category, setCategory] = useState("Thoughts")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [showMeta, setShowMeta] = useState(true)

  const saveStory = async (publish: boolean) => {
    if (!title.trim()) return
    setSaving(true)
    const slug = slugify(title)
    const wordCount = calculateWords(content)
    const excerpt = content.replace(/<[^>]*>/g, "").slice(0, 200)
    const generatedSlug = `${slug}-${Date.now()}`

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          slug: generatedSlug,
          content,
          excerpt,
          category,
          wordCount,
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
      <main className="relative z-10 pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </Link>

            <div className="flex items-center gap-1.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs transition-all",
                    mode === m.id
                      ? "glass text-primary border border-primary/20"
                      : "text-muted-foreground/50 hover:text-foreground border border-transparent"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn("space-y-4 mb-6", mode === "focus" && "max-w-3xl mx-auto")}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story Title..."
              className="text-2xl sm:text-3xl font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/20"
            />
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Add a subtitle..."
              className="text-base border-none bg-transparent px-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/20 text-muted-foreground/50"
            />
          </motion.div>

          <TipTapEditor content={content} onChange={setContent} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-40",
              mode === "fullscreen" && "hidden"
            )}
          >
            <div className="glass-strong border-t border-white/10">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground/40">
                  <span>{metrics.words} words</span>
                  <span className="hidden sm:inline">{metrics.characters} chars</span>
                  <span className="hidden sm:inline">{metrics.paragraphs} paragraphs</span>
                  <span>{metrics.readingTime} min read</span>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-8 text-xs rounded-xl w-[110px] sm:w-[130px] glass border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => saveStory(false)}
                    disabled={saving || !title.trim()}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-8 text-xs gap-1.5 text-muted-foreground/60 hover:text-foreground"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save Draft</span>
                  </Button>
                  <Button
                    onClick={() => saveStory(true)}
                    disabled={saving || !title.trim()}
                    size="sm"
                    className="rounded-xl h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Publish</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}