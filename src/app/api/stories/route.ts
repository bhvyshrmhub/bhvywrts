import { NextRequest, NextResponse } from "next/server"
import { sb } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth"
import bcrypt from "bcryptjs"

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

  // Never expose passwordHash in public responses.
  // For locked stories, do not expose story content in the list.
  const safeStories = stories?.map((s: Record<string, unknown>) => {
    const { passwordHash: _hash, ...safe } = s
    if (safe.isLocked) {
      return { ...safe, content: "" }
    }
    return safe
  })

  return NextResponse.json(safeStories || [])
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
  }

  const body = await req.json()

  const now = new Date().toISOString()
  
  let passwordHash: string | null = null

  if (body.isLocked) {
    const pwd = typeof body.password === "string" ? body.password.trim() : ""
    if (!pwd) {
      return NextResponse.json(
        { error: "A password is required for a locked story." },
        { status: 400 }
      )
    }

    passwordHash = await bcrypt.hash(pwd, 12)
  }

  const { data: story, error } = await sb()
    .insert({
      id: crypto.randomUUID(),
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
      isLocked: body.isLocked ?? false,
      passwordHash: passwordHash,
      wordCount: body.wordCount ?? 0,
      readingTime: body.readingTime ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Never return passwordHash in the response
  const { passwordHash: _hash, ...safeStory } = story
  return NextResponse.json(safeStory)
}
