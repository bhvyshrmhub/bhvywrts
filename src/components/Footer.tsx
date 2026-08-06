"use client"

import Link from "next/link"
import { Moon, Star } from "lucide-react"
import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] mt-24">
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <Logo href="/" size="md" />
            <p className="text-sm text-[var(--foreground-secondary)] mt-4 leading-relaxed">
              A personal digital journal — stories, thoughts, and worlds written under the moonlight.
            </p>
            <div className="flex items-center gap-2 mt-5 text-[var(--muted)]">
              <Moon className="w-3.5 h-3.5" />
              <Star className="w-3 h-3" />
              <Star className="w-2.5 h-2.5" />
              <span className="text-xs font-[var(--font-grotesk)] tracking-wide">
                Written at 2 AM, mostly.
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-[0.25em] mb-4 font-[var(--font-grotesk)]">
              Explore
            </h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/stories">Stories</FooterLink>
              <FooterLink href="/collections">Collections</FooterLink>
              <FooterLink href="/about">About</FooterLink>
            </div>
          </div>

          {/* Moods */}
          <div>
            <h4 className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-[0.25em] mb-4 font-[var(--font-grotesk)]">
              By Mood
            </h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/stories?mood=Moonlight">Moonlight</FooterLink>
              <FooterLink href="/stories?mood=Heartbreak">Heartbreak</FooterLink>
              <FooterLink href="/stories?mood=Hope">Hope</FooterLink>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-[0.25em] mb-4 font-[var(--font-grotesk)]">
              Connect
            </h4>
            <div className="flex flex-col gap-3">
              <FooterLink href="/admin">Admin</FooterLink>
              <span className="text-sm text-[var(--muted)]">
                Crafted with ink, moonlight &amp; love.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-14 pt-8 border-t border-white/[0.05]">
          <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
            © {new Date().getFullYear()} Bhavya Writes. All stories belong to Bhavya.
          </p>
          <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">
            Bhavya Writes 2.0 · A Digital Journal
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
