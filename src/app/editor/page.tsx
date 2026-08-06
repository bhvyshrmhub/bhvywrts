"use client"

import { Navbar } from "@/components/Navbar"
import { StoryEditorForm } from "@/components/StoryEditorForm"

export default function NewStoryPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative pt-12 md:pt-16">
        <StoryEditorForm />
      </main>
    </div>
  )
}
