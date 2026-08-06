"use client"

import { useState, useEffect, use } from "react"
import { Navbar } from "@/components/Navbar"
import { StoryEditorForm } from "@/components/StoryEditorForm"
import type { Story } from "@/types"

export default function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stories/${id}`)
      .then((r) => r.json())
      .then((data: Story) => {
        setStory(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <main className="relative pt-12 md:pt-16 max-w-5xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="h-4 skeleton rounded w-1/4" />
            <div className="h-10 skeleton rounded w-3/4" />
            <div className="h-64 skeleton rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative pt-12 md:pt-16">
        <StoryEditorForm existingStory={story} />
      </main>
    </div>
  )
}
