import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isAuthenticated } from "@/lib/auth"

const protectedRoutes = ["/dashboard", "/editor"]

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url)

  if (
    protectedRoutes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))
  ) {
    if (!(await isAuthenticated(req))) {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*"],
}
