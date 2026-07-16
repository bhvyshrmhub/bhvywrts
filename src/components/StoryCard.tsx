"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, BookOpen, Calendar, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import type { Story } from "@/types"

interface StoryCardProps {
  story: Story
  index?: number
}

export function StoryCard({ story, index = 0 }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -8 }}
    >
      <Link href={`/stories/${story.slug}`} className="group block h-full">
        <div
          className={cn(
            "relative h-full rounded-2xl overflow-hidden",
            "glass-card",
            "elevation-2",
            "transition-all duration-500",
            "group-hover:elevation-4",
            "group-hover:border-primary/30",
            "group-hover:[transform:perspective(1200px)_rotateX(2deg)_rotateY(2deg)_scale(1.01)]"
          )}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {story.coverImage ? (
            <div className="relative h-48 overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${story.coverImage})` }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-primary/[0.03] via-accent/[0.02] to-secondary/[0.03] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary/20" />
            </div>
          )}

          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium glass text-primary/80 border border-primary/20">
                {story.category}
              </span>
              {story.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400/80 border border-amber-500/20">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {story.title}
            </h3>

            {story.excerpt && (
              <p className="text-sm text-muted-foreground/70 line-clamp-2 leading-relaxed">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground/50">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                {story.wordCount} words
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {story.readingTime} min read
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(story.createdAt)}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] group-hover:ring-primary/20 transition-all pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}