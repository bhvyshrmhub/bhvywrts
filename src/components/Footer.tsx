"use client"

import Link from "next/link"
import { Logo } from "./Logo"
import { ThemeToggle } from "./ThemeToggle"

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] mt-12 md:mt-20 bg-background/60">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Logo href="/" size="sm" className="inline-block" />
            <p className="text-xs text-[var(--foreground-secondary)] mt-2 font-[var(--font-source-serif)] italic">
              A personal digital journal &amp; essays.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-[var(--font-grotesk)]" aria-label="Footer">
            <FooterLink href="/stories">Stories</FooterLink>
            <FooterLink href="/collections">Collections</FooterLink>
            <FooterLink href="/writing-journey">Calendar</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <div className="inline-flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <ThemeToggle />
            </div>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 pt-6 border-t border-[var(--border)] font-[var(--font-grotesk)]">
          <p className="text-[11px] text-[var(--muted)]">
            &copy; {new Date().getFullYear()} Bhavya Writes. All stories written by Bhavya.
          </p>
          <p className="text-[11px] text-[var(--muted)]">
            Bhavya Writes &middot; October Edition
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  )
}
