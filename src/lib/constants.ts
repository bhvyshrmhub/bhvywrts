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

export const SITE_CONFIG = {
  name: "Bhavy Writes",
  tagline: "Stories, thoughts, and worlds crafted by Bhavy.",
  author: "Bhavy",
  description: "A collection of stories, reflections, and imagination.",
} as const

export const WRITING_STREAK_KEY = "bhavy-writing-streak"

export const MOODS = [
  "Dreamy",
  "Calm",
  "Mystery",
  "Romantic",
  "Nature",
  "Adventure",
  "Hope",
  "Nostalgia",
] as const

export type Mood = (typeof MOODS)[number]

export const MOOD_COLORS: Record<Mood, string> = {
  Dreamy: "var(--mood-dreamy)",
  Calm: "var(--mood-calm)",
  Mystery: "var(--mood-mystery)",
  Romantic: "var(--mood-romantic)",
  Nature: "var(--mood-nature)",
  Adventure: "var(--mood-adventure)",
  Hope: "var(--mood-hope)",
  Nostalgia: "var(--mood-nostalgia)",
}

export const COLLECTIONS = [
  "Moon Diaries",
  "Midnight Thoughts",
  "Letters Never Sent",
  "Life Lessons",
  "Short Stories",
] as const

export type CollectionType = (typeof COLLECTIONS)[number]

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
]

export function parseStoryTags(tags: string): { mood?: Mood; collection?: CollectionType; accent?: string } {
  if (!tags) return {}
  const parts = tags.split(",").map((t) => t.trim().toLowerCase())
  const result: { mood?: Mood; collection?: CollectionType; accent?: string } = {}

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
    }
  }

  return result
}

export function buildTags(mood?: Mood | null, collection?: CollectionType | null, accent?: string | null): string {
  const parts: string[] = []
  if (mood) parts.push(`mood:${mood.toLowerCase()}`)
  if (collection) parts.push(`collection:${collection.toLowerCase()}`)
  if (accent) parts.push(`accent:${accent}`)
  return parts.join(",")
}
