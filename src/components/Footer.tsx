"use client"

import Link from "next/link"
import { Logo } from "./Logo"
import { ThemeToggle } from "./ThemeToggle"

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] mt-10 md:mt-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-14">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <Logo href="/" size="sm" className="inline-block" />
            <p className="text-xs text-[var(--foreground-secondary)] mt-2">
              A Digital Journal — Part 2
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer">
            <FooterLink href="/stories">Stories</FooterLink>
            <FooterLink href="/collections">Collections</FooterLink>
            <FooterLink href="/writing-journey">Calendar</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <span className="inline-flex items-center gap-2 text-[var(--foreground-secondary)]">
              <span className="text-xs">Theme</span>
              <ThemeToggle />
            </span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 pt-6 border-t border-[var(--border)]">
          <p className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
            © {new Date().getFullYear()} Bhavya Writes. All stories belong to Bhavya.
          </p>
          <p className="text-[11px] text-[var(--muted)] font-[var(--font-grotesk)]">
            Bhavya Writes 2.0 · A Digital Journal — Part 2
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
      className="text-xs text-[var(--foreground-secondary)] hover:text-foreground transition-colors w-fit"
    >
      {children}
    </Link>
  )
}
