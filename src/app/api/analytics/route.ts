import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [stories, published, featured] = await Promise.all([
    prisma.story.findMany(),
    prisma.story.count({ where: { published: true } }),
    prisma.story.count({ where: { featured: true } }),
  ])

  const totalWords = stories.reduce((acc, s) => acc + s.wordCount, 0)
  const totalReadingTime = stories.reduce((acc, s) => acc + s.readingTime, 0)

  return NextResponse.json({
    totalStories: stories.length,
    published,
    featured,
    drafts: stories.length - published,
    totalWords,
    totalReadingTime,
  })
}
