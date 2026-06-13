"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, PenSquare, Home, BookOpen, LayoutDashboard, LogOut } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { useAuthStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { isAdmin, checking, logout } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Bhavy Writes
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {displayLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all",
                  pathname === link.href
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-red-400 rounded-full hover:bg-red-400/10 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <div className="ml-2 pl-2 border-l border-border/50">
              <ThemeToggle />
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
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
            className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {displayLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all",
                    pathname === link.href
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
              <div className="pt-2 px-4">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
