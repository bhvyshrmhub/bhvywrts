"use client"

import { useState, useEffect } from "react"
import { LandingAnimation } from "@/components/LandingAnimation"
import { HomeContent } from "@/components/HomeContent"

const INTRO_KEY = "bhavy-intro-seen-v2"

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem(INTRO_KEY)
    if (seen) setShowIntro(false)
  }, [])

  if (!mounted) return null

  if (showIntro) {
    return (
      <LandingAnimation
        onComplete={() => {
          setShowIntro(false)
          localStorage.setItem(INTRO_KEY, "true")
        }}
      />
    )
  }

  return <HomeContent />
}
