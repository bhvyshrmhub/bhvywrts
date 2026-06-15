import { NextResponse } from "next/server"
import { sb } from "@/lib/supabase"

export async function GET() {
  const { data: stories, error } = await sb().select("*")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalStories = stories.length
  const published = stories.filter((s: any) => s.published).length
  const featured = stories.filter((s: any) => s.featured).length
  const totalWords = stories.reduce((acc: number, s: any) => acc + (s.wordCount || 0), 0)
  const totalReadingTime = stories.reduce((acc: number, s: any) => acc + (s.readingTime || 0), 0)

  return NextResponse.json({
    totalStories,
    published,
    featured,
    drafts: totalStories - published,
    totalWords,
    totalReadingTime,
  })
}
