import { SignJWT, jwtVerify } from "jose"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret")
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin"

export async function generateToken() {
  return await new SignJWT({ role: "admin", username: ADMIN_USERNAME })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { role: string; username: string }
  } catch {
    return null
  }
}

export function validateCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  const cookie = req.cookies.get("bhavy-auth")?.value
  return cookie || null
}

export async function isAuthenticated(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return false
  const verified = await verifyToken(token)
  return verified !== null
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 })
}
