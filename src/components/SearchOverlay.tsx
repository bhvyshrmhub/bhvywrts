"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, X, Clock, ArrowRight, CornerDownLeft } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: string | null
  coverImage: string | null
}

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("bhavy-recent-searches") || "[]")
      setRecent(stored)
    } catch {}
  }, [])

  useEffect(() => {
    if (open) {
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const { data } = await supabase
        .from("Story")
        .select("id, slug, title, excerpt, category, coverImage")
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,tags.ilike.%${q}%`)
        .eq("published", true)
        .limit(8)
      setResults(data || [])
      setActive(0)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 180)
    return () => clearTimeout(debounceRef.current)
  }, [query, search])

  const saveSearch = (term: string) => {
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem("bhavy-recent-searches", JSON.stringify(updated))
    onClose()
    setQuery("")
    setResults([])
  }

  const goTo = (slug: string) => {
    onClose()
    setQuery("")
    setResults([])
  }

  const total = results.length
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, Math.max(total - 1, 0)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[active]) {
        saveSearch(query)
        window.location.href = `/stories/${results[active].slug}`
      } else if (query.trim()) {
        saveSearch(query)
        window.location.href = `/stories?q=${encodeURIComponent(query)}`
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-xl mx-auto mt-[12vh] px-4"
          >
            <div className="glass-strong rounded-3xl overflow-hidden shadow-2xl border">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="w-[18px] h-[18px] text-[var(--foreground-secondary)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search stories, moods, collections..."
                  aria-label="Search stories"
                  className="flex-1 bg-transparent text-foreground placeholder:text-[var(--muted)] outline-none text-[15px]"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-[var(--muted)] hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="text-[10px] px-2 py-1 rounded-md border border-white/10 text-[var(--foreground-secondary)] shrink-0 font-[var(--font-grotesk)]">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[46vh] overflow-y-auto p-2">
                {!query && recent.length > 0 && (
                  <div className="py-1">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                      <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-[0.15em] font-[var(--font-grotesk)]">
                        Recent
                      </span>
                    </div>
                    {recent.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(term)
                          search(term)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground-secondary)] hover:bg-white/5 hover:text-foreground rounded-xl transition-colors text-left"
                      >
                        <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                        <span className="flex-1 truncate">{term}</span>
                        <CornerDownLeft className="w-3.5 h-3.5 text-[var(--muted)] opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}

                {!query && recent.length === 0 && (
                  <div className="py-10 px-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                      <Search className="w-4 h-4 text-[var(--muted)]" />
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] font-[var(--font-grotesk)]">⌘K</kbd> to search anywhere
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="py-10 text-center text-sm text-[var(--muted)]">Searching...</div>
                )}

                {!loading && query && results.length === 0 && (
                  <div className="py-10 px-4 text-center">
                    <p className="text-sm text-[var(--muted)]">No stories found</p>
                    <p className="text-xs text-[var(--muted)] opacity-70 mt-1">
                      Search all stories on the Stories page
                    </p>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div className="py-1">
                    {results.map((story, i) => (
                      <Link
                        key={story.id}
                        href={`/stories/${story.slug}`}
                        onClick={() => saveSearch(query)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-colors",
                          active === i ? "bg-white/5" : "hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {story.coverImage ? (
                            <img
                              src={story.coverImage}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/5 shrink-0 flex items-center justify-center">
                              <Search className="w-3.5 h-3.5 text-[var(--muted)]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{story.title}</p>
                            {story.excerpt && (
                              <p className="text-xs text-[var(--muted)] truncate mt-0.5">{story.excerpt}</p>
                            )}
                          </div>
                        </div>
                        {active === i && <ArrowRight className="w-4 h-4 text-[var(--muted)] shrink-0" />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-white/5 flex items-center gap-4 text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-white/10">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-white/10">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-white/10">↵</kbd>
                  to open
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
