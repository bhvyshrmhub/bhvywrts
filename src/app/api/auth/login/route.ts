import { NextRequest, NextResponse } from "next/server"
import { generateToken, validateCredentials } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 })
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await generateToken()

  const res = NextResponse.json({ success: true, token })

  res.cookies.set("bhavy-auth", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return res
}
