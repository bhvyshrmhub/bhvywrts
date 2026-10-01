"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Menu,
  X,
  LogOut,
  PenSquare,
  LayoutDashboard,
  BarChart3,
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
  const router = useRouter()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const ticking = useRef(false)
  const lastScrollY = useRef(0)
  const drawerOpenRef = useRef(false)

  // Keep ref in sync so scroll handler sees latest drawer state
  useEffect(() => {
    drawerOpenRef.current = drawerOpen
  }, [drawerOpen])

  // Prevent background scrolling when mobile drawer is open
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

  // Auto-close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY
          const isScrolled = currentY > 24

          setScrolled(isScrolled)

          // Don't auto-hide when drawer is open or near top
          if (drawerOpenRef.current || currentY < 80) {
            setHidden(false)
          } else if (currentY > lastScrollY.current + 8) {
            // Scrolling down — hide
            setHidden(true)
          } else if (currentY < lastScrollY.current - 8) {
            // Scrolling up — show
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
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 will-change-transform",
          scrolled ? "pt-2 md:pt-3.5" : "pt-0 md:pt-2",
          hidden && !drawerOpen ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="max-w-6xl mx-auto px-3.5 md:px-6">
          <nav
            className={cn(
              "relative flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
              scrolled
                ? "glass-strong h-12 md:h-13 px-4 md:px-6 rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.36)]"
                : "bg-transparent h-14 md:h-16 px-1.5 md:px-4"
            )}
          >
            {/* Left — Logo */}
            <div className="flex items-center shrink-0">
              <Logo href="/" size="md" />
            </div>

            {/* Center — desktop nav links with animated pill */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 rounded-full font-[var(--font-grotesk)]",
                    isActive(item.href)
                      ? "text-foreground font-semibold"
                      : "text-[var(--foreground-secondary)] hover:text-foreground"
                  )}
                >
                  {isActive(item.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-secondary border border-[var(--border-strong)] -z-10 shadow-sm"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right — theme, admin shortcuts & mobile menu button */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <ThemeToggle />

              {/* Desktop Admin Controls */}
              {adminReady && (
                <div className="hidden md:flex items-center gap-1.5 pl-1 border-l border-[var(--border)]">
                  <Link
                    href="/dashboard"
                    aria-label="Dashboard"
                    title="Dashboard"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium bg-foreground text-background hover:opacity-90 transition-all font-[var(--font-grotesk)] shadow-sm active:scale-95"
                  >
                    <PenSquare className="w-3 h-3" />
                    Write
                  </Link>
                </div>
              )}

              {/* Mobile Drawer Toggle */}
              <button
                type="button"
                onClick={() => setDrawerOpen(!drawerOpen)}
                aria-label={drawerOpen ? "Close menu" : "Open menu"}
                aria-expanded={drawerOpen}
                className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
              >
                {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Drawer Sheet */}
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
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md md:hidden"
            />

            {/* Slide-out Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[320px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col justify-between p-6 shadow-2xl md:hidden overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-6 border-b border-[var(--border)]">
                  <Logo href="/" size="sm" />
                  <button
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Journal Info / Subtitle */}
                <div className="py-4">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--orchid)] font-[var(--font-grotesk)]">
                    Digital Journal
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-1 font-[var(--font-source-serif)] italic">
                    Stories, thoughts and things left unsaid.
                  </p>
                </div>

                {/* Primary Nav Links */}
                <div className="space-y-1.5 pt-2">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-colors font-[var(--font-grotesk)]",
                          active
                            ? "bg-secondary text-foreground font-semibold border border-[var(--border-strong)]"
                            : "text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary/60"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4", active ? "text-[var(--orchid)]" : "text-[var(--muted)]")} />
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                      </Link>
                    )
                  })}
                </div>

                {/* Admin Section (if logged in) */}
                {adminReady && (
                  <div className="mt-6 pt-5 border-t border-[var(--border)] space-y-1.5">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted)] font-[var(--font-grotesk)] px-3 mb-2">
                      Admin Area
                    </p>
                    <Link
                      href="/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[var(--orchid)]" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/editor"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <PenSquare className="w-4 h-4 text-[var(--orchid)]" />
                      <span>Write story</span>
                    </Link>
                    <Link
                      href="/admin/analytics"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 text-[var(--orchid)]" />
                      <span>Analytics</span>
                    </Link>
                    <button
                      onClick={() => {
                        setDrawerOpen(false)
                        logout()
                        router.push("/")
                      }}
                      className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
