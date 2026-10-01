import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { sb } from "@/lib/supabase"

function getStoryAccessSecretKey(): Uint8Array {
  const storyAccessSecret = process.env.STORY_ACCESS_SECRET

  if (!storyAccessSecret) {
    throw new Error("STORY_ACCESS_SECRET is not configured")
  }

  return new TextEncoder().encode(storyAccessSecret)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const body = await req.json()
    const password = String(body.password || "")

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      )
    }

    const { data: story, error } = await sb()
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !story || !story.published) {
      return NextResponse.json(
        { error: "Story not found." },
        { status: 404 }
      )
    }

    if (!story.isLocked || !story.passwordHash) {
      return NextResponse.json(
        { error: "This story is not password protected." },
        { status: 400 }
      )
    }

    const validPassword = await bcrypt.compare(
      password,
      story.passwordHash
    )

    if (!validPassword) {
      return NextResponse.json(
        { error: "Incorrect password." },
        { status: 401 }
      )
    }

    const token = await new SignJWT({
      type: "story-access",
      slug: story.slug,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(getStoryAccessSecretKey())

    const response = NextResponse.json({
      success: true,
    })

    response.cookies.set("bhavy-story-access", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Story unlock error:", error)

    return NextResponse.json(
      { error: "Unable to unlock story." },
      { status: 500 }
    )
  }
}