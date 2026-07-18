"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Search, X, Clock, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface SearchResult {
  id: string
  slug: string
  title: string
  excerpt: string | null
  category: string | null
}

interface SearchBarProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SearchBar({ open: controlledOpen, onOpenChange }: SearchBarProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>(undefined)

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("bhavy-recent-searches") || "[]")
      setRecent(stored)
    } catch {}
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [setOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const { data } = await supabase
        .from("Story")
        .select("id, slug, title, excerpt, category")
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
        .limit(8)
      setResults(data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 200)
    return () => clearTimeout(debounceRef.current)
  }, [query, search])

  const saveSearch = (term: string) => {
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 5)
    setRecent(updated)
    localStorage.setItem("bhavy-recent-searches", JSON.stringify(updated))
    setOpen(false)
    setQuery("")
  }

  const closeSearch = () => {
    setOpen(false)
    setQuery("")
    setResults([])
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:border-foreground/30 transition-colors"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border border-border bg-secondary text-muted-foreground ml-2">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-xl mx-auto mt-[15vh] px-4"
            >
              <div className="bg-background border border-border rounded-lg shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 border-b border-border">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search stories..."
                    className="flex-1 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground shrink-0">
                    ESC
                  </kbd>
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {!query && recent.length > 0 && (
                    <div className="py-1">
                      <div className="flex items-center gap-2 px-2 py-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Recent</span>
                      </div>
                      {recent.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(term); saveSearch(term) }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:bg-secondary rounded-md transition-colors text-left"
                        >
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}

                  {loading && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  )}

                  {!loading && query && results.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No stories found
                    </div>
                  )}

                  {!loading && results.length > 0 && (
                    <div className="py-1">
                      {results.map((story) => (
                        <Link
                          key={story.id}
                          href={`/stories/${story.slug}`}
                          onClick={() => saveSearch(query)}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-secondary rounded-md transition-colors group"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {story.title}
                            </p>
                            {story.excerpt && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {story.excerpt}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}