import { NextRequest, NextResponse } from "next/server"
import { sb } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const sort = searchParams.get("sort") || "newest"
  const published = searchParams.get("published")

  let query = sb().select("*")

  if (published === "all") {
    // Admin: show all
  } else if (published === "true") {
    query = query.eq("published", true)
  } else if (published === "false") {
    query = query.eq("published", false)
  } else {
    query = query.eq("published", true)
  }

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,excerpt.ilike.%${search}%,tags.ilike.%${search}%`
    )
  }

  if (sort === "oldest") {
    query = query.order("createdAt", { ascending: true })
  } else if (sort === "title") {
    query = query.order("title", { ascending: true })
  } else {
    query = query.order("createdAt", { ascending: false })
  }

  const { data: stories, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(stories)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
  }

  const body = await req.json()

  const { data: story, error } = await sb()
    .insert({
      title: body.title,
      subtitle: body.subtitle || "",
      slug: body.slug,
      content: body.content || "",
      excerpt: body.excerpt || "",
      category: body.category || "Thoughts",
      tags: body.tags || "",
      coverImage: body.coverImage || "",
      published: body.published ?? false,
      featured: body.featured ?? false,
      wordCount: body.wordCount ?? 0,
      readingTime: body.readingTime ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(story)
}
