export const SITE_CONFIG = {
  name: "Bhavya Writes",
  tagline: "Stories, thoughts, and worlds crafted by Bhavya.",
  author: "Bhavya",
  description: "A personal digital journal — a writing sanctuary under the moonlight.",
  url: "https://bhavywrites.com",
} as const

export const CATEGORIES = [
  "Fiction",
  "Personal",
  "Philosophy",
  "Thoughts",
  "Life",
  "Dreams",
  "Horror",
  "Love",
  "Science Fiction",
] as const

export const WRITING_STREAK_KEY = "bhavy-writing-streak"

export const MOODS = [
  "Dreams",
  "Moonlight",
  "Silence",
  "Nature",
  "Heartbreak",
  "Hope",
  "Philosophy",
  "Rain",
  "Nostalgia",
  "Calm",
  "Mystery",
  "Adventure",
] as const

export type Mood = (typeof MOODS)[number]

export const MOOD_COLORS: Record<Mood, string> = {
  Dreams: "var(--mood-dreams)",
  Moonlight: "var(--mood-moonlight)",
  Silence: "var(--mood-silence)",
  Nature: "var(--mood-nature)",
  Heartbreak: "var(--mood-heartbreak)",
  Hope: "var(--mood-hope)",
  Philosophy: "var(--mood-philosophy)",
  Rain: "var(--mood-rain)",
  Nostalgia: "var(--mood-nostalgia)",
  Calm: "var(--mood-calm)",
  Mystery: "var(--mood-mystery)",
  Adventure: "var(--mood-adventure)",
}

export const MOOD_DESCRIPTIONS: Record<Mood, string> = {
  Dreams: "Where sleep meets story.",
  Moonlight: "Written after midnight.",
  Silence: "The quiet between words.",
  Nature: "Roots, rain, and green.",
  Heartbreak: "Tender and aching.",
  Hope: "Light at the end.",
  Philosophy: "Thoughts that wander far.",
  Rain: "Weather for the soul.",
  Nostalgia: "Letters to the past.",
  Calm: "Slow and still.",
  Mystery: "Shadows and secrets.",
  Adventure: "Roads untaken.",
}

export const COLLECTIONS = [
  "Moon Diaries",
  "Midnight Thoughts",
  "Letters Never Sent",
  "Dreams",
  "Philosophy",
  "Life Lessons",
  "Short Stories",
] as const

export type CollectionType = (typeof COLLECTIONS)[number]

export const COLLECTION_DESCRIPTIONS: Record<CollectionType, string> = {
  "Moon Diaries": "Entries written under the night sky, lit by nothing but the moon.",
  "Midnight Thoughts": "The things the mind whispers when the world finally goes quiet.",
  "Letters Never Sent": "Words I wrote to people — and never gave them.",
  "Dreams": "The strange, weightless worlds we visit when we sleep.",
  "Philosophy": "Small thoughts reaching for big answers.",
  "Life Lessons": "What life has taught me, one bruise at a time.",
  "Short Stories": "Complete little worlds in a handful of pages.",
}

export const COLLECTION_ACCENTS: Record<CollectionType, string> = {
  "Moon Diaries": "#a78bfa",
  "Midnight Thoughts": "#67e8f9",
  "Letters Never Sent": "#f471b5",
  "Dreams": "#c084fc",
  "Philosophy": "#6366f1",
  "Life Lessons": "#34d399",
  "Short Stories": "#fb923c",
}

export const DAILY_THOUGHTS = [
  "The moon does not fight the night. It waits for the sun.",
  "Some stories are not meant to be told — they are meant to be felt.",
  "Ink flows where words dare not go.",
  "A blank page is a universe waiting to be born.",
  "Stars are scars of light that refused to fade.",
  "The quietest minds hold the loudest storms.",
  "Every ending is a page turned, not a book closed.",
  "You are made of moonlight and unfinished dreams.",
  "Softness is not weakness. It is the quietest form of strength.",
  "Words are how the invisible becomes visible.",
  "Let your thoughts wander where your feet cannot.",
  "Some souls write better in the dark.",
  "Not all who wander are lost — some are just writing.",
  "The pen is a lantern in the dark.",
  "Tonight, I am a story the stars are telling.",
  "Rain has a way of washing the noise out of a mind.",
  "We are all just pages someone is still learning to read.",
  "Grief is love with nowhere to go. Write it down.",
  "The night is the paper, and the stars are the first draft.",
  "Kindness is a quiet act of rebellion.",
  "You don't find yourself. You write yourself into being.",
  "Some silences are conversations in another language.",
  "Hope is the memory of light in the middle of the dark.",
  "Every story is someone leaving a trail of breadcrumbs.",
  "The moon remembers every face that ever looked up.",
  "Being soft in a hard world is the bravest thing.",
  "A scar is a story that refused to stay silent.",
  "Home is not a place. It's a voice that says your name gently.",
  "The best pages of my life were written at 2 AM.",
  "Some doors close so better winds can find you.",
]

export interface StoryTags {
  mood?: Mood
  collection?: CollectionType
  accent?: string
  editorsPick?: boolean
  recommended?: boolean
  quote?: string
  continueSlug?: string
  coverPos?: { x: number; y: number }
}

export function parseStoryTags(tags: string): StoryTags {
  if (!tags) return {}
  const parts = tags.split(",").map((t) => t.trim().toLowerCase())
  const result: StoryTags = {}

  for (const part of parts) {
    if (part.startsWith("mood:")) {
      const mood = part.replace("mood:", "")
      const match = MOODS.find((m) => m.toLowerCase() === mood)
      if (match) result.mood = match
    } else if (part.startsWith("collection:")) {
      const col = part.replace("collection:", "")
      const match = COLLECTIONS.find((c) => c.toLowerCase() === col)
      if (match) result.collection = match
    } else if (part.startsWith("accent:")) {
      result.accent = part.replace("accent:", "")
    } else if (part === "editorspick:true") {
      result.editorsPick = true
    } else if (part === "editorspick:false") {
      result.editorsPick = false
    } else if (part === "recommended:true") {
      result.recommended = true
    } else if (part === "recommended:false") {
      result.recommended = false
    } else if (part.startsWith("quote:")) {
      const raw = part.replace("quote:", "")
      if (raw) result.quote = raw.replace(/·/g, ",").replace(/_/g, " ")
    } else if (part.startsWith("continue:")) {
      const raw = part.replace("continue:", "")
      if (raw) result.continueSlug = raw
    } else if (part.startsWith("coverpos:")) {
      const raw = part.replace("coverpos:", "")
      const [x, y] = raw.split("_").map((v) => parseFloat(v))
      if (!Number.isNaN(x) && !Number.isNaN(y)) result.coverPos = { x, y }
    }
  }

  return result
}

export function buildTags(options: {
  mood?: Mood | null
  collection?: CollectionType | null
  accent?: string | null
  editorsPick?: boolean | null
  recommended?: boolean | null
  quote?: string | null
  continueSlug?: string | null
  coverPos?: { x: number; y: number } | null
}): string {
  const parts: string[] = []
  if (options.mood) parts.push(`mood:${options.mood.toLowerCase()}`)
  if (options.collection) parts.push(`collection:${options.collection.toLowerCase()}`)
  if (options.accent) parts.push(`accent:${options.accent}`)
  if (options.editorsPick !== null && options.editorsPick !== undefined) {
    parts.push(`editorspick:${options.editorsPick}`)
  }
  if (options.recommended !== null && options.recommended !== undefined) {
    parts.push(`recommended:${options.recommended}`)
  }
  if (options.quote) parts.push(`quote:${options.quote.trim().replace(/,/g, "·").replace(/\s+/g, "_").slice(0, 200)}`)
  if (options.continueSlug) parts.push(`continue:${options.continueSlug}`)
  if (options.coverPos) parts.push(`coverpos:${options.coverPos.x}_${options.coverPos.y}`)
  return parts.join(",")
}

export const ACCENTS = [
  { name: "Orchid", value: "#b16cea" },
  { name: "Lavender", value: "#a78bfa" },
  { name: "Soft Cyan", value: "#67e8f9" },
  { name: "Deep Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f471b5" },
  { name: "Emerald", value: "#34d399" },
  { name: "Amber", value: "#fbbf24" },
  { name: "Ember", value: "#fb923c" },
] as const
