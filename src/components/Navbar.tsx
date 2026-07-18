"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BookOpen, LayoutDashboard, PenSquare, Search, LogOut } from "lucide-react"
import { SearchBar } from "./SearchBar"
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

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/stories", label: "Library", icon: BookOpen },
  ]

  const adminLinks = isAdmin && !checking
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/editor", label: "Write", icon: PenSquare },
      ]
    : []

  return (
    <>
      <SearchBar open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Desktop Nav */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:block transition-colors duration-300",
          scrolled ? "bg-background/95 border-b border-border" : "bg-transparent"
        )}
      >
        <nav className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-lg font-[var(--font-brand)] text-foreground leading-none">
                  Bhavy Writes
                </span>
              </Link>
              <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3 py-1.5 text-sm transition-colors",
                      pathname === link.href
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-foreground"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-lg hover:border-foreground/30 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border border-border bg-secondary text-muted-foreground ml-2">
                  ⌘K
                </kbd>
              </button>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && !checking && (
                <button
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border">
        <div className="flex items-center justify-around h-14 px-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
          >
            <Search className="w-4 h-4" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          {[...navLinks, ...adminLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <link.icon className="w-4 h-4" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
          {isAdmin && !checking && (
            <button
              onClick={logout}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-[10px] font-medium">Logout</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </>
  )
}