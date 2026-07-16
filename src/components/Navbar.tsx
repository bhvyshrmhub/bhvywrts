"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, PenSquare, Home, BookOpen, LayoutDashboard, LogOut, Sparkles } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastScroll = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      setScrolled(current > 20)
      if (current > 200) {
        setHidden(current > lastScroll.current)
      } else {
        setHidden(false)
      }
      lastScroll.current = current
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const publicLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/stories", label: "Stories", icon: BookOpen },
  ]

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/editor", label: "Write", icon: PenSquare },
  ]

  const displayLinks = checking ? publicLinks : isAdmin ? [...publicLinks, ...adminLinks] : publicLinks

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -120 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glass border-b border-white/10 shadow-lg shadow-black/5"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -3 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <span className="text-lg font-semibold tracking-tight gradient-text bg-gradient-to-r from-primary via-accent to-secondary">
              Bhavy Writes
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {displayLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                active={pathname === link.href}
                icon={<link.icon className="w-4 h-4" />}
                label={link.label}
              />
            ))}
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
            <div className="ml-3 pl-3 border-l border-white/10">
              <ThemeToggle />
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-full glass text-muted-foreground hover:text-foreground transition-all"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden glass-strong border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-2">
              {displayLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 text-sm rounded-2xl transition-all",
                    pathname === link.href
                      ? "glass text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:glass"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm text-muted-foreground hover:text-destructive rounded-2xl hover:glass transition-all w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
              <div className="pt-4 px-2 flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function NavLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="relative">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all relative",
          active
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {active && (
          <motion.div
            layoutId="navbar-active"
            className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/20"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          {icon}
          {label}
        </span>
      </motion.div>
    </Link>
  )
}