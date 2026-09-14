"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  shine?: boolean
}

export function Logo({ href, size = "md", className, shine = false }: LogoProps) {
  const logoText = (
    <span
      className={cn(
        "inline-flex items-baseline select-none tracking-tight leading-none transition-all duration-300",
        shine ? "gradient-shine" : "gradient-logo",
        size === "sm" && "text-lg",
        size === "md" && "text-xl",
        size === "lg" && "text-3xl",
        size === "xl" && "text-4xl",
        className
      )}
      style={{ fontFamily: "var(--font-instrument-serif)" }}
    >
      Bhavya Writes
    </span>
  )

  if (href) {
    return (
      <Link href={href} aria-label="Bhavya Writes — home" className="inline-block">
        {logoText}
      </Link>
    )
  }

  return logoText
}
