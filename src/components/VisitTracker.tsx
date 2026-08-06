"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

const VISITOR_COOKIE = "bv_visitor"
const VISITED_COOKIE = "bv_visited"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function generateId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function VisitTracker() {
  const pathname = usePathname()
  const lastPath = useRef("")
  const tracking = useRef(false)

  useEffect(() => {
    if (tracking.current) return
    tracking.current = true

    let visitorId = getCookie(VISITOR_COOKIE)
    let isNewVisitor = false

    if (!visitorId) {
      visitorId = generateId()
      setCookie(VISITOR_COOKIE, visitorId, 365)
      isNewVisitor = true
    }

    const hasVisitedBefore = getCookie(VISITED_COOKIE)
    if (!hasVisitedBefore) {
      setCookie(VISITED_COOKIE, "1", 365)
    }

    const path = pathname || "/"
    let page = path
    let storySlug: string | null = null
    if (path === "/") page = "homepage"
    else if (path === "/stories") page = "stories"
    else if (path.startsWith("/stories/")) {
      page = "story"
      storySlug = path.replace("/stories/", "").split("/")[0] || null
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        path,
        storySlug,
        visitorId,
        isReturning: !(isNewVisitor || !hasVisitedBefore),
      }),
    }).catch(() => {})

    lastPath.current = page
  }, [pathname])

  return null
}
