"use client"

import Link from "next/link"
import { Logo } from "./Logo"
import { ThemeToggle } from "./ThemeToggle"

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--border)] mt-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <Logo href="/" size="md" className="inline-block" />
            <p className="text-sm text-[var(--foreground-secondary)] mt-3">
              A Digital Journal — Part 2
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3" aria-label="Footer">
            <FooterLink href="/stories">Stories</FooterLink>
            <FooterLink href="/collections">Collections</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <span className="inline-flex items-center gap-2 text-[var(--foreground-secondary)]">
              <span className="text-sm">Theme</span>
              <ThemeToggle />
            </span>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-8 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
            © {new Date().getFullYear()} Bhavya Writes. All stories belong to Bhavya.
          </p>
          <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
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
      className="text-sm text-[var(--foreground-secondary)] hover:text-foreground transition-colors w-fit"
    >
      {children}
    </Link>
  )
}
