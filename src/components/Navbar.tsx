"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { LogOut, PenSquare, LayoutDashboard, BarChart3, MoreHorizontal } from "lucide-react"
import { Logo } from "./Logo"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/stories", label: "Stories" },
  { href: "/collections", label: "Collections" },
  { href: "/writing-journey", label: "Calendar" },
] as const

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const ticking = useRef(false)
  const lastScrollY = useRef(0)
  const menuOpenRef = useRef(false)

  // Keep ref in sync so scroll handler sees latest menu state
  useEffect(() => {
    menuOpenRef.current = menuOpen
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY
          const isScrolled = currentY > 24

          setScrolled(isScrolled)

          // Don't auto-hide when menu is open or near top
          if (menuOpenRef.current || currentY < 80) {
            setHidden(false)
          } else if (currentY > lastScrollY.current + 6) {
            // Scrolling down — hide
            setHidden(true)
          } else if (currentY < lastScrollY.current - 6) {
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
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const adminReady = isAdmin && !checking

  const isActive = (href: string) => {
    if (href === "/stories" && pathname === "/stories") return true
    if (href === "/collections" && pathname.startsWith("/collections")) return true
    if (href === "/writing-journey" && pathname === "/writing-journey") return true
    return false
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 will-change-transform",
        scrolled ? "pt-2 md:pt-3" : "pt-0",
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-6xl mx-auto px-3 md:px-6">
        <nav
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 ease-out will-change-transform",
            scrolled
              ? "glass-strong h-11 md:h-12 px-3 md:px-5 rounded-full border-b"
              : "bg-transparent h-14 md:h-16 px-1 md:px-3"
          )}
        >
          {/* Left — BW logo */}
          <div className="flex items-center shrink-0">
            <Logo href="/" size="md" />
          </div>

          {/* Center — nav links with animated pill */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "relative px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 rounded-full font-[var(--font-grotesk)]",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-[var(--foreground-secondary)] hover:text-foreground"
                )}
              >
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-secondary border border-[var(--border)] -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right — theme + admin */}
          <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
            <ThemeToggle />

            {adminReady && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  title="Dashboard"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <Link
                  href="/editor"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white text-black hover:bg-white/90 transition-colors font-[var(--font-grotesk)]"
                >
                  <PenSquare className="w-3 h-3" />
                  Write
                </Link>
              </div>
            )}

            {/* Mobile admin overflow */}
            {adminReady && (
              <div className="md:hidden relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Admin menu"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl glass-strong overflow-hidden border border-[var(--border)] z-50"
                    >
                      <div className="py-1.5">
                        <MobileMenuItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" onClick={() => setMenuOpen(false)} />
                        <MobileMenuItem href="/editor" icon={<PenSquare className="w-4 h-4" />} label="Write a story" onClick={() => setMenuOpen(false)} />
                        <MobileMenuItem href="/admin/analytics" icon={<BarChart3 className="w-4 h-4" />} label="Analytics" onClick={() => setMenuOpen(false)} />
                        <div className="my-1 h-px bg-[var(--border)]" />
                        <button
                          onClick={() => {
                            setMenuOpen(false)
                            logout()
                            router.push("/")
                          }}
                          className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  )
}

function MobileMenuItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[var(--foreground-secondary)] hover:text-foreground hover:bg-secondary transition-colors"
    >
      {icon}
      {label}
    </Link>
  )
}
