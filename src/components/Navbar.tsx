"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Menu,
  X,
  PenSquare,
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react"
import { Logo } from "./Logo"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/stories", label: "Stories", icon: BookOpen },
  { href: "/collections", label: "Collections", icon: FolderOpen },
  { href: "/writing-journey", label: "Calendar", icon: Calendar },
  { href: "/about", label: "About", icon: User },
] as const

export function Navbar() {
  const pathname = usePathname()
  const { isAdmin, checking } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const ticking = useRef(false)
  const lastScrollY = useRef(0)
  const drawerOpenRef = useRef(false)

  const isStoryPage = pathname.startsWith("/stories/") && pathname !== "/stories"

  useEffect(() => {
    drawerOpenRef.current = drawerOpen
  }, [drawerOpen])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY
          const isScrolled = currentY > 20

          setScrolled(isScrolled)

          if (drawerOpenRef.current || currentY < 60) {
            setHidden(false)
          } else if (currentY > lastScrollY.current + 8) {
            setHidden(true)
          } else if (currentY < lastScrollY.current - 8) {
            setHidden(false)
          }

          lastScrollY.current = currentY
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
      if (e.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const adminReady = isAdmin && !checking

  const isActive = (href: string) => {
    if (href === "/stories" && pathname === "/stories") return true
    if (href === "/collections" && pathname.startsWith("/collections")) return true
    if (href === "/writing-journey" && pathname === "/writing-journey") return true
    if (href === "/about" && pathname === "/about") return true
    return false
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-3 sm:top-4 inset-x-0 z-50 transition-transform duration-300 will-change-transform px-3.5 sm:px-6 pointer-events-none",
          hidden && !drawerOpen ? "-translate-y-24" : "translate-y-0"
        )}
      >
        <div className="max-w-[1100px] mx-auto pointer-events-auto">
          <nav
            className={cn(
              "relative flex items-center justify-between h-14 md:h-[58px] px-3 md:px-5 rounded-full transition-all duration-300",
              "glass-pill shadow-[0_12px_40px_rgba(0,0,0,0.35)]",
              isStoryPage && "bg-[var(--glass-fill)]/70 backdrop-blur-xl opacity-90 hover:opacity-100"
            )}
          >
            {/* Left — Logo Wordmark */}
            <div className="flex items-center shrink-0 pl-1">
              <Logo href="/" size="md" />
            </div>

            {/* Center — Desktop Nav Links with Sliding Highlight */}
            <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-black/10 dark:bg-white/5 border border-white/5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-4 py-1.5 text-xs font-medium transition-colors duration-200 rounded-full font-[var(--font-grotesk)]",
                      active
                        ? "text-foreground font-semibold"
                        : "text-[var(--text-2)] hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="navbar-pill-active"
                        className="absolute inset-0 rounded-full bg-white/20 dark:bg-white/15 border border-white/25 shadow-sm -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right — Theme Toggle, Admin Controls & Mobile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {/* Admin Write Pill */}
              {adminReady && (
                <div className="hidden sm:flex items-center gap-1.5 pl-1.5 border-l border-[var(--glass-border)]">
                  <Link
                    href="/dashboard"
                    aria-label="Dashboard"
                    title="Dashboard"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--text-2)] hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-all font-[var(--font-grotesk)] shadow-sm active:scale-95"
                  >
                    <PenSquare className="w-3 h-3" />
                    <span>Write</span>
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Trigger */}
              <button
                type="button"
                onClick={() => setDrawerOpen(!drawerOpen)}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                aria-expanded={drawerOpen}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] text-[var(--text)] hover:bg-white/10 transition-colors cursor-pointer"
              >
                {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Drawer (Aurora Frosted Glass Slide from Top/Side) */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md md:hidden"
            />

            {/* Glass Drawer Panel */}
            <motion.aside
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-0 inset-x-0 z-[70] p-4 md:hidden pointer-events-auto"
            >
              <div className="glass-strong rounded-[32px] p-6 shadow-2xl border border-[var(--glass-border)] max-w-md mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
                  <Logo href="/" size="sm" />
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--glass-border)] text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="py-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)]">
                    Digital Journal
                  </p>
                  <p className="text-xs text-[var(--text-3)] mt-1 font-[var(--font-source-serif)] italic">
                    Stories, thoughts and things left unsaid.
                  </p>
                </div>

                {/* Primary Nav Links */}
                <nav className="space-y-1.5 py-2">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all font-[var(--font-grotesk)]",
                          active
                            ? "bg-white/20 dark:bg-white/15 text-foreground font-semibold border border-white/20"
                            : "text-[var(--text-2)] hover:text-foreground hover:bg-white/10"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-[var(--orchid)]" />
                          <span>{item.label}</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    )
                  })}
                </nav>

                {/* Mobile Admin Section */}
                {adminReady && (
                  <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-center gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 text-center py-2.5 rounded-xl border border-[var(--glass-border)] text-xs font-medium font-[var(--font-grotesk)] hover:bg-white/10 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/editor"
                      onClick={() => setDrawerOpen(false)}
                      className="flex-1 text-center py-2.5 rounded-xl bg-foreground text-background text-xs font-medium font-[var(--font-grotesk)] hover:opacity-90 transition-opacity"
                    >
                      Write Story
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
