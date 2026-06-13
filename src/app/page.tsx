"use client"

import { useState, useEffect } from "react"
import { LandingAnimation } from "@/components/LandingAnimation"
import { HomeContent } from "@/components/HomeContent"

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem("bhavy-intro-seen")
    if (seen) {
      setShowIntro(false)
    }
  }, [])

  const handleComplete = () => {
    setShowIntro(false)
    localStorage.setItem("bhavy-intro-seen", "true")
  }

  if (!mounted) return null

  if (showIntro) {
    return <LandingAnimation onComplete={handleComplete} />
  }

  return <HomeContent />
}
