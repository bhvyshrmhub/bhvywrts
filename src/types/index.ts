export interface Story {
  id: string
  title: string
  subtitle: string
  slug: string
  content: string
  excerpt: string
  category: string
  tags: string
  coverImage: string
  published: boolean
  featured: boolean
  wordCount: number
  readingTime: number
  createdAt: string
  updatedAt: string
}

export type Theme = 'midnight' | 'ocean' | 'sunset' | 'forest' | 'galaxy' | 'paper'

export interface ThemeConfig {
  id: Theme
  name: string
  bg: string
  cardBg: string
  text: string
  accent: string
  muted: string
  border: string
  glow: string
  gradient: string
}

export interface EditorMetrics {
  words: number
  characters: number
  paragraphs: number
  readingTime: number
}

export type WritingMode = 'normal' | 'focus' | 'typewriter' | 'zen' | 'fullscreen'
