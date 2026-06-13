import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function calculateReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function calculateWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}
