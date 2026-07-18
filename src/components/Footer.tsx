"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-[var(--font-brand)] text-foreground leading-none">
              Bhavy Writes
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Stories, thoughts, and worlds crafted by Bhavy.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/stories" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Library
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Connect</h4>
            <div className="flex flex-col gap-2">
              <Link href="/admin" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-end justify-end">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Bhavy Writes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}