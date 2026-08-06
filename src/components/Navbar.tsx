"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Search, Menu, X, LogOut, User, PenSquare } from "lucide-react"
import { SearchOverlay } from "./SearchOverlay"
import { Logo } from "./Logo"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
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
          const y = window.scrollY
          setScrolled(y > 24)
          setCompact(y > 140)
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const adminReady = isAdmin && !checking

  const isActive = (href: string) => {
    if (href === "/stories" && pathname === "/stories") return true
    if (href === "/collections" && pathname.startsWith("/collections")) return true
    if (href === "/about" && pathname === "/about") return true
    return false
  }

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 will-change-transform",
          scrolled ? "pt-2 md:pt-3" : "pt-0"
        )}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <nav
            className={cn(
              "relative flex items-center justify-between transition-all duration-500 ease-out rounded-full will-change-transform",
              scrolled ? "glass-strong h-12 md:h-14 px-4 md:px-6" : "bg-transparent h-16 md:h-20 px-0 md:px-2",
              scrolled && "border-b"
            )}
          >
            {/* Left — desktop full links, mobile Stories */}
            <div className="flex items-center gap-1 md:gap-1.5">
              <NavLink href="/stories" active={isActive("/stories")} label="Stories" className="hidden sm:inline-flex" />
              <NavLink href="/collections" active={isActive("/collections")} label="Collections" className="hidden lg:inline-flex" />
              <button
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                  searchOpen
                    ? "text-foreground bg-white/5"
                    : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5"
                )}
                aria-label="Search stories (⌘K)"
              >
                <Search className="w-4 h-4" />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-[var(--foreground-secondary)] font-[var(--font-grotesk)]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Center — logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Logo
                href="/"
                size={compact ? "sm" : "md"}
                className={cn(
                  "transition-all duration-500",
                  compact ? "opacity-80" : "opacity-100"
                )}
              />
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 md:gap-1.5">
              {/* Mobile: search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label="Search stories"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              <NavLink href="/about" active={isActive("/about")} label="About" className="hidden sm:inline-flex" />

              {adminReady ? (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    href="/dashboard"
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      pathname.startsWith("/dashboard") ? "text-foreground bg-white/5" : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm bg-white text-black hover:bg-white/90 transition-colors"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    Write
                  </Link>
                </div>
              ) : (
                <NavLink
                  href="/admin"
                  active={pathname === "/admin"}
                  label="Admin"
                  className="hidden md:inline-flex"
                />
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5 transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu — top sheet, no bottom nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden"
            >
              <div className="mx-4 mt-2 rounded-3xl glass-strong overflow-hidden border-t-0">
                <div className="px-3 py-3 space-y-0.5">
                  <MobileLink href="/stories" label="Stories" onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/collections" label="Collections" onClick={() => setMenuOpen(false)} />
                  <MobileLink href="/about" label="About" icon={<User className="w-4 h-4" />} onClick={() => setMenuOpen(false)} />
                  {adminReady && (
                    <>
                      <MobileLink href="/dashboard" label="Dashboard" onClick={() => setMenuOpen(false)} />
                      <MobileLink href="/editor" label="Write a story" icon={<PenSquare className="w-4 h-4" />} onClick={() => setMenuOpen(false)} />
                      <MobileLink href="/admin/analytics" label="Analytics" onClick={() => setMenuOpen(false)} />
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          logout()
                          router.push("/")
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </>
                  )}
                  {!adminReady && (
                    <MobileLink href="/admin" label="Admin" onClick={() => setMenuOpen(false)} />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}

function NavLink({
  href,
  label,
  active,
  className,
}: {
  href: string
  label: string
  active: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3 py-1.5 text-sm transition-colors",
        active
          ? "text-foreground bg-white/5"
          : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5",
        className
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="nav-dot"
          className="absolute left-1/2 -bottom-[3px] h-[2px] w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#b16cea] to-[#67e8f9]"
        />
      )}
    </Link>
  )
}

function MobileLink({
  href,
  label,
  icon,
  onClick,
}: {
  href: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-2xl text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-white/5 transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}
