import { NextRequest, NextResponse } from "next/server"
import { sb } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const { data: story, error } = await sb()
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!story.published && !(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(story)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const { data: story, error } = await sb()
    .update({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.coverImage !== undefined && { coverImage: body.coverImage }),
      ...(body.published !== undefined && { published: body.published }),
      ...(body.featured !== undefined && { featured: body.featured }),
      ...(body.wordCount !== undefined && { wordCount: body.wordCount }),
      ...(body.readingTime !== undefined && { readingTime: body.readingTime }),
      updatedAt: new Date().toISOString(),
    })
    .eq("slug", slug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(story)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { error } = await sb().delete().eq("slug", slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
