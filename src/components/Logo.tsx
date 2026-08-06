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
  )

  if (href) {
    return (
      <Link href={href} aria-label="Bhavya Writes — home">
        {content}
      </Link>
    )
  }

  return content
}
