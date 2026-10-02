"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Save,
  Check,
  Star,
  Sparkles,
  Feather,
  Eye,
  Quote,
  ArrowRight,
  Lock,
  Unlock,
  EyeOff,
  Eye as EyeIcon,
} from "lucide-react"
import { TipTapEditor } from "./TipTapEditor"
import { CoverImageUpload } from "./CoverImageUpload"
import { useEditorStore } from "@/lib/store"
import {
  slugify,
  calculateReadingTime,
  calculateWords,
  cn,
} from "@/lib/utils"
import {
  CATEGORIES,
  MOODS,
  COLLECTIONS,
  ACCENTS,
  buildTags,
  parseStoryTags,
  type Mood,
  type CollectionType,
} from "@/lib/constants"
import { supabase } from "@/lib/supabase-client"
import type { Story } from "@/types"

interface StoryEditorFormProps {
  existingStory?: Story | null
  onSaved?: (slug: string) => void
}

const modes = [
  { id: "normal" as const, label: "Normal" },
  { id: "focus" as const, label: "Focus" },
  { id: "typewriter" as const, label: "Typewriter" },
  { id: "zen" as const, label: "Zen" },
  { id: "fullscreen" as const, label: "Fullscreen" },
]

export function StoryEditorForm({
  existingStory,
  onSaved,
}: StoryEditorFormProps) {
  const router = useRouter()
  const { metrics, mode, setMode } = useEditorStore()

  const initialTags = useMemo(
    () => parseStoryTags(existingStory?.tags || ""),
    [existingStory?.tags]
  )

  const [title, setTitle] = useState(existingStory?.title || "")
  const [subtitle, setSubtitle] = useState(existingStory?.subtitle || "")
  const [category, setCategory] = useState(
    existingStory?.category || "Thoughts"
  )
  const [content, setContent] = useState(existingStory?.content || "")
  const [coverImage, setCoverImage] = useState<string | null>(
    existingStory?.coverImage || null
  )
  const [saving, setSaving] = useState(false)

  const [coverPos, setCoverPos] = useState<{ x: number; y: number }>(
    initialTags.coverPos ?? { x: 50, y: 40 }
  )

  const [mood, setMood] = useState<Mood | "">(
    initialTags.mood || ""
  )
  const [collection, setCollection] = useState<CollectionType | "">(
    initialTags.collection || ""
  )
  const [accent, setAccent] = useState(initialTags.accent || "")
  const [featured, setFeatured] = useState(
    existingStory?.featured || false
  )
  const [editorsPick, setEditorsPick] = useState(
    initialTags.editorsPick || false
  )
  const [recommended, setRecommended] = useState(
    initialTags.recommended || false
  )
  const [quote, setQuote] = useState(initialTags.quote || "")
  const [continueSlug, setContinueSlug] = useState(
    initialTags.continueSlug || ""
  )

  // ---------------------------------------------------------
  // STORY PASSWORD PROTECTION
  // ---------------------------------------------------------

  const [isLocked, setIsLocked] = useState(
    existingStory?.isLocked || false
  )

  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [allStories, setAllStories] = useState<Story[]>([])

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from("Story")
        .select("slug, title")
        .eq("published", true)
        .neq("slug", existingStory?.slug || "")
        .order("title", { ascending: true })
        .limit(200)

      if (data) setAllStories(data as unknown as Story[])
    })()
  }, [existingStory?.slug])

  const excerpt = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, "").trim()
    const firstParagraph = text.split(/\n\s*\n/)[0] || text
    if (firstParagraph.length <= 220) return firstParagraph
    const cut = firstParagraph.slice(0, 220)
    const lastSpace = cut.lastIndexOf(" ")
    return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + "…"
  }, [content])

  const tags = useMemo(
    () =>
      buildTags({
        mood: mood || null,
        collection: collection || null,
        accent: accent || null,
        editorsPick,
        recommended,
        quote: quote || null,
        continueSlug: continueSlug || null,
        coverPos,
      }),
    [
      mood,
      collection,
      accent,
      editorsPick,
      recommended,
      quote,
      continueSlug,
      coverPos,
    ]
  )

  // ---------------------------------------------------------
  // SAVE STORY
  // ---------------------------------------------------------

  const saveStory = useCallback(
    async (publish: boolean) => {
      if (!title.trim()) return

      // A NEW locked story requires a password.
      if (!existingStory && isLocked && !password.trim()) {
        alert("Please enter a password for this private story.")
        return
      }

      setSaving(true)

      const wordCount = calculateWords(content)

      const payload: Record<string, unknown> = {
        title: title.trim(),
        subtitle,
        content,
        excerpt,
        category,
        coverImage,
        tags,
        wordCount,
        readingTime: calculateReadingTime(content),
        published: publish,
        featured,
        isLocked,
      }

      // Only send a password when the admin actually entered one.
      //
      // For an existing locked story:
      // - empty password = keep existing password
      // - new password = replace existing password
      //
      // The server hashes it before storing it.
      if (isLocked && password.trim()) {
        payload.password = password.trim()
      }

      try {
        let slug: string

        if (existingStory) {
          const res = await fetch(
            `/api/stories/${existingStory.slug}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
          )

          if (!res.ok) {
            const errorData = await res.json().catch(() => null)

            throw new Error(
              errorData?.error || "Failed to update"
            )
          }

          slug = existingStory.slug
        } else {
          const newSlug = `${slugify(title)}-${Date.now()}`

          const res = await fetch("/api/stories", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...payload,
              slug: newSlug,
            }),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => null)

            throw new Error(
              errorData?.error || "Failed to save"
            )
          }

          slug = newSlug
        }

        if (onSaved) onSaved(slug)

        router.push(`/editor/${slug}`)
      } catch (e) {
        console.error("Save failed:", e)

        alert(
          e instanceof Error
            ? e.message
            : "Something went wrong while saving the story."
        )
      }

      setSaving(false)
    },
    [
      title,
      subtitle,
      content,
      excerpt,
      category,
      coverImage,
      tags,
      featured,
      existingStory,
      router,
      onSaved,
      isLocked,
      password,
    ]
  )

  const seoTitle = useMemo(() => {
    if (title.trim()) {
      return `${title.trim()} — Bhavya Writes`
    }

    return "Untitled — Bhavya Writes"
  }, [title])

  const accentSwatch =
    accent || initialTags.accent || "#ffb6d9"

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-32">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-wrap items-center justify-between gap-3 mb-8 pt-6"
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] font-[var(--font-grotesk)] mb-1.5">
              {existingStory ? "Editing" : "Writing"}
            </p>

            <h1 className="font-[var(--font-instrument-serif)] text-2xl md:text-3xl text-foreground">
              {existingStory
                ? existingStory.title || "Untitled"
                : "New Story"}
            </h1>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full glass-pill">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] transition-all font-[var(--font-grotesk)]",
                  mode === m.id
                    ? "glass-strong text-foreground border border-white/20 shadow-sm font-medium"
                    : "text-[var(--muted)] hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-3">
            <div
              className={cn(
                "space-y-5 mb-6",
                mode === "focus" && "max-w-3xl mx-auto"
              )}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Story title..."
                aria-label="Story title"
                className="w-full text-2xl sm:text-3xl font-[var(--font-instrument-serif)] bg-transparent border-none outline-none placeholder:text-[var(--muted)] text-foreground"
              />

              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A subtitle or an opening line..."
                aria-label="Subtitle"
                className="w-full text-base bg-transparent border-none outline-none placeholder:text-[var(--muted)] text-[var(--foreground-secondary)]"
              />
            </div>

            <TipTapEditor
              content={content}
              onChange={setContent}
            />
          </div>

          {/* RIGHT: SETTINGS */}
          <div className="lg:col-span-2 space-y-5">
            {/* COVER */}
            <div className="glass-card rounded-3xl p-5">
              <CoverImageUpload
                currentImage={coverImage}
                onImageChange={setCoverImage}
              />

              {coverImage && (
                <div className="mt-3">
                  <label className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-medium font-[var(--font-grotesk)]">
                    Cover focus
                  </label>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">
                      ←
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={coverPos.x}
                      onChange={(e) =>
                        setCoverPos((p) => ({
                          ...p,
                          x: parseInt(
                            e.target.value,
                            10
                          ),
                        }))
                      }
                      aria-label="Cover horizontal focus"
                      className="flex-1 accent-[#ffb6d9]"
                    />

                    <span className="text-[10px] text-[var(--muted)] font-[var(--font-grotesk)]">
                      →
                    </span>
                  </div>

                  <div className="relative mt-2 rounded-xl overflow-hidden aspect-[16/6] bg-black">
                    <img
                      src={coverImage}
                      alt="Cover position preview"
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: `${coverPos.x}% 50%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* STORY ACCESS */}
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-start gap-3 mb-5">
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 transition-all",
                    isLocked
                      ? "border-[var(--orchid)]/40 bg-[var(--orchid)]/10 text-[var(--orchid)]"
                      : "border-[var(--border)] bg-white/[0.03] text-[var(--muted)]"
                  )}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1">
                  <SectionLabel>
                    Story Access
                  </SectionLabel>

                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                    Choose who can read this story.
                  </p>
                </div>
              </div>

              {/* PUBLIC OPTION */}
              <button
                type="button"
                onClick={() => {
                  setIsLocked(false)
                  setPassword("")
                }}
                aria-pressed={!isLocked}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all mb-2",
                  !isLocked
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] bg-transparent"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    !isLocked
                      ? "bg-white text-black"
                      : "bg-white/[0.04] text-[var(--muted)]"
                  )}
                >
                  <Unlock className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      !isLocked
                        ? "text-foreground"
                        : "text-[var(--foreground-secondary)]"
                    )}
                  >
                    Public
                  </p>

                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    Anyone can read this story.
                  </p>
                </div>

                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    !isLocked
                      ? "border-white"
                      : "border-[var(--border-strong)]"
                  )}
                >
                  {!isLocked && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              {/* PASSWORD OPTION */}
              <button
                type="button"
                onClick={() => setIsLocked(true)}
                aria-pressed={isLocked}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all",
                  isLocked
                    ? "border-[var(--orchid)]/40 bg-[var(--orchid)]/[0.06]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] bg-transparent"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center",
                    isLocked
                      ? "bg-[var(--orchid)]/15 text-[var(--orchid)]"
                      : "bg-white/[0.04] text-[var(--muted)]"
                  )}
                >
                  <Lock className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm",
                      isLocked
                        ? "text-foreground"
                        : "text-[var(--foreground-secondary)]"
                    )}
                  >
                    Password Protected
                  </p>

                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    Only people with the password can read it.
                  </p>
                </div>

                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center",
                    isLocked
                      ? "border-[var(--orchid)]"
                      : "border-[var(--border-strong)]"
                  )}
                >
                  {isLocked && (
                    <div className="w-2 h-2 rounded-full bg-[var(--orchid)]" />
                  )}
                </div>
              </button>

              {/* PASSWORD FIELD */}
              {isLocked && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    marginTop: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginTop: 14,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                >
                  <label className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-medium font-[var(--font-grotesk)]">
                    {existingStory
                      ? "Change Password"
                      : "Password"}
                  </label>

                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder={
                        existingStory
                          ? "Leave empty to keep current password"
                          : "Enter a password..."
                      }
                      autoComplete="new-password"
                      className="w-full h-11 pl-3 pr-11 rounded-xl bg-white/[0.03] border border-[var(--border)] text-sm text-foreground placeholder:text-[var(--muted)] outline-none focus:border-[var(--orchid)]/50 transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-foreground transition-colors"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-start gap-2 mt-2.5">
                    <Lock className="w-3 h-3 text-[var(--orchid)] mt-0.5 shrink-0" />

                    <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                      {existingStory
                        ? "Leave this empty to keep the current password. Enter a new one to change it."
                        : "This password is securely hashed on the server. Visitors will need it to read the story."}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* IDENTITY */}
            <div className="glass-card rounded-3xl p-5 space-y-4">
              <SectionLabel>Mood</SectionLabel>

              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setMood(mood === m ? "" : m)
                    }
                    aria-pressed={mood === m}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[11px] border transition-colors font-[var(--font-grotesk)]",
                      mood === m
                        ? "mood-chip"
                        : "border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--border-strong)]"
                    )}
                    style={
                      mood === m
                        ? {
                            color: `var(--mood-${m.toLowerCase()})`,
                          }
                        : undefined
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>

              <SectionLabel>Accent</SectionLabel>

              <div className="flex flex-wrap gap-2.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() =>
                      setAccent(
                        accent === a.value ? "" : a.value
                      )
                    }
                    aria-label={a.name}
                    aria-pressed={accent === a.value}
                    title={a.name}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-transform",
                      accent === a.value
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{
                      background: a.value,
                      boxShadow:
                        accent === a.value
                          ? `0 0 16px ${a.value}66`
                          : undefined,
                    }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionLabel>
                    Collection
                  </SectionLabel>

                  <select
                    value={collection}
                    onChange={(e) =>
                      setCollection(
                        e.target.value as
                          | CollectionType
                          | ""
                      )
                    }
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-[var(--border)] text-xs text-[var(--foreground-secondary)] outline-none cursor-pointer [color-scheme:dark]"
                  >
                    <option value="">None</option>

                    {COLLECTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <SectionLabel>
                    Category
                  </SectionLabel>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.03] border border-[var(--border)] text-xs text-[var(--foreground-secondary)] outline-none cursor-pointer [color-scheme:dark]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* FLAGS */}
            <div className="glass-card rounded-3xl p-5 space-y-2">
              <FlagToggle
                active={featured}
                onClick={() =>
                  setFeatured(!featured)
                }
                icon={<Sparkles className="w-4 h-4" />}
                label="Featured"
                hint="Shown as the homepage hero"
              />

              <FlagToggle
                active={editorsPick}
                onClick={() =>
                  setEditorsPick(!editorsPick)
                }
                icon={<Star className="w-4 h-4" />}
                label="Editor's Pick"
                hint="Badge + editor's picks section"
              />

              <FlagToggle
                active={recommended}
                onClick={() =>
                  setRecommended(!recommended)
                }
                icon={<Feather className="w-4 h-4" />}
                label="Recommended"
                hint="Shown in recommended reads"
              />
            </div>

            {/* QUOTE */}
            <div className="glass-card rounded-3xl p-5">
              <SectionLabel>
                <Quote className="w-3.5 h-3.5 inline mr-1" />
                Highlighted Quote
              </SectionLabel>

              <textarea
                value={quote}
                onChange={(e) =>
                  setQuote(e.target.value)
                }
                rows={3}
                placeholder="A quote from the story to feature..."
                className="w-full mt-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-[var(--border)] text-sm text-foreground placeholder:text-[var(--muted)] outline-none focus:border-[var(--orchid)]/40 transition-colors resize-none"
              />

              <p className="text-[10px] text-[var(--muted)] mt-1.5 font-[var(--font-grotesk)]">
                Leave empty to auto-pick a sentence from the story.
              </p>
            </div>

            {/* CONTINUE READING */}
            <div className="glass-card rounded-3xl p-5">
              <SectionLabel>
                <ArrowRight className="w-3.5 h-3.5 inline mr-1" />
                Continue Reading
              </SectionLabel>

              <select
                value={continueSlug}
                onChange={(e) =>
                  setContinueSlug(e.target.value)
                }
                className="w-full h-9 mt-2 px-3 rounded-xl bg-white/[0.03] border border-[var(--border)] text-xs text-[var(--foreground-secondary)] outline-none cursor-pointer [color-scheme:dark]"
              >
                <option value="">
                  Auto — next related story
                </option>

                {allStories.map((s) => (
                  <option
                    key={s.slug}
                    value={s.slug}
                  >
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* SEO PREVIEW */}
            <div className="glass-card rounded-3xl p-5">
              <SectionLabel>
                <Eye className="w-3.5 h-3.5 inline mr-1" />
                SEO Preview
              </SectionLabel>

              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--border)] p-3.5">
                <p className="text-[11px] text-[#8ab4f8] truncate">
                  {seoTitle}
                </p>

                <p className="text-[11px] text-[#87ceeb] truncate mt-0.5">
                  bhavywrites.com/stories/
                  {slugify(title) || "story"}
                </p>

                <p className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2">
                  {excerpt ||
                    "No excerpt yet — the first sentence will be used."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          mode === "fullscreen" && "hidden"
        )}
      >
        <div className="glass-strong border-t border-[var(--border)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
              <span>{metrics.words} words</span>

              <span className="hidden sm:inline">
                {metrics.paragraphs} paragraphs
              </span>

              <span>
                {metrics.readingTime} min read
              </span>

              {isLocked && (
                <span className="hidden sm:flex items-center gap-1.5 text-[var(--orchid)]">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}

              {accentSwatch && (
                <span className="hidden md:flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: accentSwatch,
                    }}
                  />
                  Accent
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => saveStory(false)}
                disabled={
                  saving || !title.trim()
                }
                className="h-9 px-4 text-xs rounded-full glass-pill hover:scale-105 transition-all disabled:opacity-40 flex items-center gap-1.5 font-[var(--font-grotesk)]"
              >
                <Save className="w-3.5 h-3.5 text-[var(--accent)]" />

                <span className="hidden sm:inline">
                  Save Draft
                </span>

                <span className="sm:hidden">
                  Draft
                </span>
              </button>

              <button
                onClick={() => saveStory(true)}
                disabled={
                  saving || !title.trim()
                }
                className="h-9 px-4 text-xs rounded-full bg-[var(--text)] text-[var(--bg-base)] hover:opacity-90 hover:scale-105 transition-all disabled:opacity-40 flex items-center gap-1.5 font-[var(--font-grotesk)] font-medium shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />

                {existingStory ? (
                  <span className="hidden sm:inline">
                    Update
                  </span>
                ) : (
                  <span className="hidden sm:inline">
                    Publish
                  </span>
                )}

                <span className="sm:hidden">
                  Save
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SectionLabel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <label className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-medium font-[var(--font-grotesk)]">
      {children}
    </label>
  )
}

function FlagToggle({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-secondary transition-colors text-left"
    >
      <span
        className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center border transition-colors",
          active
            ? "border-[var(--orchid)]/40 text-[var(--orchid)] bg-[var(--orchid)]/10"
            : "border-[var(--border)] text-[var(--muted)]"
        )}
      >
        {icon}
      </span>

      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm",
            active
              ? "text-foreground"
              : "text-[var(--foreground-secondary)]"
          )}
        >
          {label}
        </span>

        <span className="block text-[10px] text-[var(--muted)] font-[var(--font-grotesk)] mt-0.5">
          {hint}
        </span>
      </span>

      <span
        className={cn(
          "w-8 h-[18px] rounded-full border transition-colors relative shrink-0",
          active
            ? "bg-[var(--orchid)]/60 border-[var(--orchid)]"
            : "bg-[var(--border)] border-[var(--border)]"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all",
            active
              ? "left-[14px] bg-white"
              : "left-[2px] bg-[var(--muted)]"
          )}
        />
      </span>
    </button>
  )
}