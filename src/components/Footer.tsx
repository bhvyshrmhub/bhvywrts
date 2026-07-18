"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-[var(--font-brand)] text-foreground leading-none">
              Bhavy Writes
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Stories, thoughts, and worlds crafted by Bhavy.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4">Explore</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/stories" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Stories
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mb-4">Connect</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/admin" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-end justify-end">
            <p className="text-xs text-muted-foreground/60">
              &copy; {new Date().getFullYear()} Bhavy Writes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}