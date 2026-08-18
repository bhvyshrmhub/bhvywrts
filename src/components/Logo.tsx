"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  shine?: boolean
}

const SIZES = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-6xl md:text-7xl",
}

export function Logo({ href, size = "md", className, shine = false }: LogoProps) {
  const content = (
    <span className="inline-flex items-center gap-2 select-none">
      {/* Tiny crescent moon accent on larger sizes */}
      {size !== "sm" && size !== "md" && (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="w-[0.34em] h-[0.34em] mb-[0.45em] shrink-0 opacity-90"
          style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.55))" }}
          fill="none"
          stroke="url(#logo-moon-grad)"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="logo-moon-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a78bfa" />
              <stop offset="1" stopColor="#e879f9" />
            </linearGradient>
          </defs>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      )}
      <span
        className={cn(
          "font-[var(--font-great-vibes)] leading-none tracking-normal select-none",
          shine ? "gradient-shine" : "gradient-logo",
          SIZES[size],
          className
        )}
        data-text="Bhavya Writes"
      >
        Bhavya Writes
      </span>
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label="Bhavya Writes — home" className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}
