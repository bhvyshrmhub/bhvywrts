export function detectDevice(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return "Tablet"
  if (/mobile|ip(hone|od)|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return "Mobile"
  return "Desktop"
}

export function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (ua.includes("edg")) return "Edge"
  if (ua.includes("opr") || ua.includes("opera")) return "Opera"
  if (ua.includes("chrome") && !ua.includes("edg")) return "Chrome"
  if (ua.includes("firefox")) return "Firefox"
  if (ua.includes("safari") && !ua.includes("chrome")) return "Safari"
  return "Other"
}

export function classifyReferrer(referrer: string): string {
  if (!referrer || referrer === "") return "Direct"
  const ref = referrer.toLowerCase()
  if (ref.includes("google")) return "Google"
  if (ref.includes("facebook") || ref.includes("fb.com") || ref.includes("meta")) return "Social Media"
  if (ref.includes("twitter") || ref.includes("x.com") || ref.includes("t.co")) return "Social Media"
  if (ref.includes("instagram")) return "Social Media"
  if (ref.includes("linkedin")) return "Social Media"
  if (ref.includes("reddit")) return "Social Media"
  if (ref.includes("pinterest")) return "Social Media"
  if (ref.includes("youtube") || ref.includes("youtu.be")) return "Social Media"
  if (ref.includes("bing") || ref.includes("yahoo") || ref.includes("duckduckgo") || ref.includes("yandex")) return "Search Engine"
  if (ref.includes("whatsapp") || ref.includes("telegram") || ref.includes("discord")) return "Messaging"
  if (ref.includes("medium") || ref.includes("newsletter") || ref.includes("substack")) return "Referral"
  if (ref.includes("localhost") || ref.includes("bhavywrites") || ref.includes("bhavy-writes")) return "Direct"
  return "Other"
}

export function getCurrentDateTime() {
  const now = new Date()
  const date = now.toISOString().split("T")[0]
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  return { date, time }
}

export function extractStorySlug(page: string): string | null {
  const match = page.match(/^\/stories\/([^/?]+)/)
  return match ? match[1] : null
}

export function formatPageName(page: string): string {
  if (page === "/" || page === "") return "Homepage"
  if (page.startsWith("/stories/")) return `"${decodeURIComponent(page.replace("/stories/", "").replace(/-/g, " "))}"`
  if (page === "/stories") return "Stories"
  if (page === "/dashboard") return "Dashboard"
  if (page === "/dashboard/analytics") return "Analytics"
  if (page === "/admin") return "Admin Login"
  if (page.startsWith("/editor")) return "Editor"
  return page || "Unknown"
}
