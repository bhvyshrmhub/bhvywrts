import { NextRequest, NextResponse } from "next/server"
import { sb } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

function getStoryAccessSecretKey(): Uint8Array {
  const storyAccessSecret = process.env.STORY_ACCESS_SECRET

  if (!storyAccessSecret) {
    throw new Error("STORY_ACCESS_SECRET is not configured")
  }

  return new TextEncoder().encode(storyAccessSecret)
}

async function hasStoryAccess(
  req: NextRequest,
  slug: string
) {
  const token = req.cookies.get("bhavy-story-access")?.value

  if (!token) return false

  try {
    const key = getStoryAccessSecretKey()
    const { payload } = await jwtVerify(
      token,
      key
    )

    return (
      payload.type === "story-access" &&
      payload.slug === slug
    )
  } catch {
    return false
  }
}

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>
  }
) {
  const { slug } = await params

  const { data: story, error } = await sb()
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !story) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  const admin = await isAuthenticated(req)

  // Unpublished stories remain admin-only.
  if (!story.published && !admin) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    )
  }

  // Admin can always access the complete story.
  if (admin) {
    const {
      passwordHash,
      ...safeStory
    } = story

    return NextResponse.json(safeStory)
  }

  // Public story.
  if (!story.isLocked) {
    const {
      passwordHash,
      ...safeStory
    } = story

    return NextResponse.json(safeStory)
  }

  // Check whether this visitor has already unlocked
  // this particular story.
  const unlocked = await hasStoryAccess(
    req,
    slug
  )

  if (unlocked) {
    const {
      passwordHash,
      ...safeStory
    } = story

    return NextResponse.json(safeStory)
  }

  // Locked story:
  // NEVER send the story content or password hash.
  return NextResponse.json(
    {
      locked: true,
      story: {
        id: story.id,
        title: story.title,
        subtitle: story.subtitle,
        slug: story.slug,
        excerpt: story.excerpt,
        category: story.category,
        tags: story.tags,
        coverImage: story.coverImage,
        published: story.published,
        isLocked: true,
        featured: story.featured,
        readingTime: story.readingTime,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt,
      },
    },
    {
      status: 423,
    }
  )
}

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>
  }
) {
  const { slug } = await params

  if (!(await isAuthenticated(req))) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()

  /*
   * PASSWORD HANDLING
   *
   * undefined = don't change existing password
   * null = remove password
   * string = create a new bcrypt hash
   */

  let passwordHash:
    | string
    | null
    | undefined = undefined

  if (body.isLocked === false) {
    // Removing protection removes the password.
    passwordHash = null
  }

  if (body.isLocked === true) {
    const pwd = typeof body.password === "string" ? body.password.trim() : ""
    if (pwd) {
      passwordHash = await bcrypt.hash(pwd, 12)
    } else {
      // If the admin is editing an already protected
      // story without entering a new password,
      // preserve the existing password.

      const { data: existingStory } =
        await sb()
          .select("passwordHash")
          .eq("slug", slug)
          .single()

      if (!existingStory?.passwordHash) {
        return NextResponse.json(
          {
            error:
              "A password is required for a locked story.",
          },
          {
            status: 400,
          }
        )
      }
    }
  }

  const { data: story, error } =
    await sb()
      .update({
        ...(body.title !== undefined && {
          title: body.title,
        }),

        ...(body.subtitle !== undefined && {
          subtitle: body.subtitle,
        }),

        ...(body.content !== undefined && {
          content: body.content,
        }),

        ...(body.excerpt !== undefined && {
          excerpt: body.excerpt,
        }),

        ...(body.category !== undefined && {
          category: body.category,
        }),

        ...(body.tags !== undefined && {
          tags: body.tags,
        }),

        ...(body.coverImage !== undefined && {
          coverImage: body.coverImage,
        }),

        ...(body.published !== undefined && {
          published: body.published,
        }),

        ...(body.featured !== undefined && {
          featured: body.featured,
        }),

        ...(body.wordCount !== undefined && {
          wordCount: body.wordCount,
        }),

        ...(body.readingTime !== undefined && {
          readingTime: body.readingTime,
        }),

        ...(body.isLocked !== undefined && {
          isLocked: body.isLocked,
        }),

        ...(passwordHash !== undefined && {
          passwordHash,
        }),

        updatedAt: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select()
      .single()

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }

  // Never return the password hash to the browser.
  const {
    passwordHash: _passwordHash,
    ...safeStory
  } = story

  return NextResponse.json(safeStory)
}

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>
  }
) {
  const { slug } = await params

  if (!(await isAuthenticated(req))) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const { error } = await sb()
    .delete()
    .eq("slug", slug)

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    )
  }

  return NextResponse.json({
    success: true,
  })
}