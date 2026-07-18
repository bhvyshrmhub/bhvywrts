"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Bookmark, User, BookOpen, LogOut } from "lucide-react"
import { SearchOverlay } from "./SearchOverlay"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const lastScroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setScrolled(current > 40)
      if (current > 200) setHidden(current > lastScroll.current)
      else setHidden(false)
      lastScroll.current = current
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") setSearchOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const logoRef = useRef<HTMLAnchorElement>(null)

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Desktop Nav */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:block transition-colors duration-300",
          scrolled ? "glass-strong" : "bg-transparent"
        )}
      >
        <nav className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="w-[200px]">
              <Link
                href="/stories"
                className={cn(
                  "relative text-sm transition-colors",
                  pathname === "/stories" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Stories
                {pathname === "/stories" && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-foreground"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </div>

            {/* Center */}
            <Link
              ref={logoRef}
              href="/"
              className="text-xl font-[var(--font-brand)] text-foreground hover:text-accent transition-colors"
              id="nav-logo"
            >
              Bhavy Writes
            </Link>

            {/* Right */}
            <div className="w-[200px] flex items-center justify-end gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                  ⌘K
                </kbd>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Liquid Glass Nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-around h-14 px-2 rounded-2xl glass-strong">
          <Link
            href="/stories"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
              pathname === "/stories" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[9px] font-medium">Stories</span>
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
          >
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-medium">Search</span>
          </button>

          <Link
            href="/stories?bookmarked=true"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
              pathname === "/stories" && "text-foreground" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[9px] font-medium">Books</span>
          </Link>

          {isAdmin && !checking ? (
            <>
              <Link
                href="/dashboard"
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
              >
                <User className="w-5 h-5" />
                <span className="text-[9px] font-medium">Admin</span>
              </Link>
              <button
                onClick={logout}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[9px] font-medium">Exit</span>
              </button>
            </>
          ) : (
            <Link
              href="/admin"
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
            >
              <User className="w-5 h-5" />
              <span className="text-[9px] font-medium">Me</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}