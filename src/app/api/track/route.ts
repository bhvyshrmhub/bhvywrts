import { NextRequest, NextResponse } from "next/server"
import { visitDb } from "@/lib/supabase"
import { isAuthenticated } from "@/lib/auth"

const SIMPLE_UA =
  /^(Mozilla|Chrome|Safari|Firefox|Edge|Opera|SamsungBrowser|UCBrowser|Amazon Silk|Googlebot|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|Bytespider|CCBot|GPTBot|Applebot)/i

function parseDevice(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "tablet"
  if (/mobile|android|iphone|ipod|webos|blackberry|opera mini|iemobile/i.test(ua)) return "mobile"
  return "desktop"
}

function parseBrowser(ua: string): string {
  if (/edg|edge/i.test(ua)) return "Edge"
  if (/opr|opera/i.test(ua)) return "Opera"
  if (/chrome|chromium/i.test(ua)) return "Chrome"
  if (/firefox/i.test(ua)) return "Firefox"
  if (/safari/i.test(ua)) return "Safari"
  if (/samsung/i.test(ua)) return "Samsung"
  if (/ucbrowser/i.test(ua)) return "UC Browser"
  if (/silk|amazon/i.test(ua)) return "Silk"
  return "Other"
}

function parseReferrer(ref: string | null): string {
  if (!ref) return "direct"
  const lower = ref.toLowerCase()
  if (/google\./i.test(lower)) return "google"
  if (/bing\./i.test(lower)) return "bing"
  if (/yahoo\./i.test(lower)) return "yahoo"
  if (/duckduckgo\./i.test(lower)) return "duckduckgo"
  if (/facebook\.com|fb\.com|fb\.me/i.test(lower)) return "facebook"
  if (/twitter\.com|x\.com|t\.co/i.test(lower)) return "twitter"
  if (/instagram\.com/i.test(lower)) return "instagram"
  if (/linkedin\.com/i.test(lower)) return "linkedin"
  if (/reddit\.com/i.test(lower)) return "reddit"
  if (/pinterest\.com/i.test(lower)) return "pinterest"
  if (/tiktok\.com/i.test(lower)) return "tiktok"
  if (/youtube\.com|youtu\.be/i.test(lower)) return "youtube"
  if (/whatsapp|wa\.me/i.test(lower)) return "whatsapp"
  if (/telegram/i.test(lower)) return "telegram"
  if (/github\.com/i.test(lower)) return "github"
  return "referral"
}

function derivePageName(path: string): string {
  if (path === "/") return "homepage"
  if (path === "/stories") return "stories"
  if (path === "/dashboard") return "dashboard"
  if (path === "/editor") return "editor"
  if (path.startsWith("/admin")) return "admin"
  if (path.startsWith("/stories/")) return "story"
  return path
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { page, path, storySlug, category, visitorId } = body

    const ua = req.headers.get("user-agent") || ""
    const ref = req.headers.get("referer") || null
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-country") ||
      null

    const record = {
      id: crypto.randomUUID(),
      page: page || derivePageName(path || "/"),
      path: path || "/",
      story_slug: storySlug || null,
      category: category || null,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      country: country,
      referrer: parseReferrer(ref),
      is_returning: !!body.isReturning,
      visitor_id: visitorId || "unknown",
      created_at: new Date().toISOString(),
    }

    const { error } = await visitDb().insert(record)
    if (error) {
      console.error("Track error:", error)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const story = searchParams.get("story")
  const device = searchParams.get("device")
  const limit = parseInt(searchParams.get("limit") || "100", 10)

  let query = visitDb().select("*").order("created_at", { ascending: false }).limit(Math.min(limit, 500))

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`)
    const end = new Date(`${date}T23:59:59.999Z`)
    query = query.gte("created_at", start.toISOString()).lte("created_at", end.toISOString())
  }
  if (story) {
    query = query.eq("story_slug", story)
  }
  if (device) {
    query = query.eq("device", device)
  }

  const { data: visits, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(visits || [])
}
