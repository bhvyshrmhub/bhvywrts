"use client"

import Link from "next/link"
import { Heart, Sparkles, BookOpen, ArrowUp } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 mt-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-primary/[0.04] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: -3, scale: 1.05 }}
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </motion.div>
              <span className="text-sm font-semibold gradient-text bg-gradient-to-r from-primary via-accent to-secondary">
                Bhavy Writes
              </span>
            </Link>
            <p className="text-sm text-muted-foreground/70 leading-relaxed max-w-xs">
              A personal digital writing sanctuary — stories, reflections, and imagination.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/50">
              Explore
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/stories", label: "Stories" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground/60 hover:text-foreground transition-all w-fit hover:translate-x-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/50">
              Connect
            </h4>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground/60">
                Crafted with care by Bhavy.
              </p>
              <motion.button
                onClick={scrollToTop}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-sm text-primary/60 hover:text-primary transition-all w-fit"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                Back to top
              </motion.button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <div className="text-xs text-muted-foreground/40">
            &copy; {new Date().getFullYear()} Bhavy Writes. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
            Made with <Heart className="w-3 h-3 text-destructive fill-destructive/60" /> by{" "}
            <span className="text-foreground/60">Bhavy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}