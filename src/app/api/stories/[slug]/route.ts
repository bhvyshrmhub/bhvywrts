import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const story = await prisma.story.findUnique({ where: { slug } })

  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Only allow viewing drafts if authenticated
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

  // Extra safety beyond middleware
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const story = await prisma.story.update({ where: { slug }, data: body })
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

  await prisma.story.delete({ where: { slug } })
  return NextResponse.json({ success: true })
}
