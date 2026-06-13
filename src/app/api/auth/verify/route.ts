import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req)
  const payload = token ? await verifyToken(token) : null

  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true, username: payload.username })
}
