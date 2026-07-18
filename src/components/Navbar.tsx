"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, LogOut, Menu, X, Bookmark } from "lucide-react"
import { SearchOverlay } from "./SearchOverlay"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [compact, setCompact] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ticking = useRef(false)

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const current = window.scrollY
          setScrolled(current > 40)
          setCompact(current > 120)
          ticking.current = false
        })
        ticking.current = true
      }
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
      if (e.key === "Escape") { setSearchOpen(false); setMenuOpen(false) }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const extraLinks = [
    ...(isAdmin && !checking
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/editor", label: "Write" },
        ]
      : []),
    ...(!isAdmin || checking ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow] duration-300 will-change-transform",
          scrolled ? "glass-strong" : "bg-transparent"
        )}
      >
        <nav className="max-w-6xl mx-auto px-5 md:px-6 will-change-transform">
          <div
            className={cn(
              "flex items-center justify-between transition-[height] duration-300 ease-out will-change-transform",
              compact ? "h-10 md:h-12" : "h-12 md:h-16"
            )}
          >
            {/* Left */}
            <div className="flex items-center gap-1 w-[80px] md:w-[200px]">
              <Link
                href="/stories"
                className={cn(
                  "relative text-sm transition-colors whitespace-nowrap",
                  pathname === "/stories" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Stories
                {pathname === "/stories" && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </div>

            {/* Center */}
            <Link
              href="/"
              className={cn(
                "font-[var(--font-brand)] gradient-logo relative",
                compact ? "text-base md:text-lg" : "text-lg md:text-xl"
              )}
              id="nav-logo"
            >
              Bhavy Writes
            </Link>

            {/* Right */}
            <div className="flex items-center justify-end gap-1 w-[80px] md:w-[200px]">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Menu"
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden glass-strong border-t border-glass-border"
            >
              <div className="px-5 py-3 space-y-1">
                <MobileLink href="/stories" label="Stories" current={pathname} onClick={() => setMenuOpen(false)} />
                <MobileLink href="/stories?bookmarked=true" label="Bookmarks" icon={Bookmark} current={pathname} onClick={() => setMenuOpen(false)} />
                <button
                  onClick={() => { setSearchOpen(true); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                {extraLinks.map((link) => (
                  <MobileLink key={link.href} href={link.href} label={link.label} current={pathname} onClick={() => setMenuOpen(false)} />
                ))}
                {isAdmin && !checking && (
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}

function MobileLink({ href, label, icon: Icon, current, onClick }: {
  href: string
  label: string
  icon?: React.ElementType
  current: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
        current === href ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </Link>
  )
}
