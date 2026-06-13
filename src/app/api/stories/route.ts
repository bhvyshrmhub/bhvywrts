import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "newest"
  const published = searchParams.get("published")

  const where: Record<string, unknown> = {}

  if (published === "all") {
    // Admin only: show all stories
  } else if (published === "true") {
    where.published = true
  } else if (published === "false") {
    where.published = false
  } else {
    where.published = true
  }

  if (category && category !== "all") where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { tags: { contains: search } },
    ]
  }

  const orderBy: Record<string, string> =
    sort === "oldest" ? { createdAt: "asc" } :
    sort === "title" ? { title: "asc" } :
    { createdAt: "desc" }

  const stories = await prisma.story.findMany({ where, orderBy })

  return NextResponse.json(stories)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
  }

  const body = await req.json()
  const story = await prisma.story.create({ data: body })
  return NextResponse.json(story)
}
