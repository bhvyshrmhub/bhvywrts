"use client"

import dynamic from "next/dynamic"

const WritingJourney = dynamic(() => import("@/components/WritingJourney"))

export default function WritingJourneyPage() {
  return <WritingJourney />
}
