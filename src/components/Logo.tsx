"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  shine?: boolean
}

export function Logo({ href, size = "md", className, shine = false }: LogoProps) {
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!expanded) return
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [expanded])

  useEffect(() => {
    if (!expanded) return
    function handle(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false)
    }
    document.addEventListener("keydown", handle)
    return () => document.removeEventListener("keydown", handle)
  }, [expanded])

  const bwMark = (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex items-center select-none cursor-pointer",
        className
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setExpanded((v) => !v)
      }}
      role={href ? "link" : "button"}
      aria-label={expanded ? "Close brand" : "Bhavya Writes — home"}
    >
      {/* BW Monogram */}
      <span
        className={cn(
          "font-[var(--font-instrument-serif)] font-normal tracking-tight leading-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          shine ? "gradient-shine" : "gradient-logo",
          size === "sm" && "text-xl",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl",
          size === "xl" && "text-5xl",
          expanded && "opacity-0 w-0 overflow-hidden"
        )}
        style={{ minWidth: expanded ? 0 : undefined }}
      >
        BW
      </span>

      {/* Expanded brand */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="inline-flex items-baseline gap-0">
              <span
                className={cn(
                  "font-[var(--font-great-vibes)] leading-none gradient-logo",
                  size === "sm" && "text-2xl",
                  size === "md" && "text-3xl",
                  size === "lg" && "text-5xl",
                  size === "xl" && "text-6xl"
                )}
              >
                Bhavya Writes
              </span>
            </span>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "text-[var(--muted)] font-[var(--font-source-serif)] italic mt-0.5",
                size === "sm" && "text-[10px]",
                size === "md" && "text-xs",
                size === "lg" && "text-sm",
                size === "xl" && "text-sm"
              )}
            >
              A little place for my thoughts.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )

  if (href && !expanded) {
    return (
      <Link href={href} aria-label="Bhavya Writes — home" className="inline-block">
        {bwMark}
      </Link>
    )
  }

  return bwMark
}
