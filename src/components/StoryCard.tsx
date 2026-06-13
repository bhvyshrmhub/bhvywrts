"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, BookOpen, Calendar } from "lucide-react"
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -10 }}
    >
      <Link href={`/stories/${story.slug}`} className="group block h-full">
        <div
          className={cn(
            "relative h-full rounded-2xl overflow-hidden",
            "border border-border/40",
            "bg-gradient-to-br from-card/40 via-card/20 to-card/40",
            "backdrop-blur-xl",
            "shadow-xl shadow-black/5",
            "transition-all duration-500",
            "group-hover:border-accent/40 group-hover:shadow-2xl group-hover:shadow-accent/10",
            "group-hover:[transform:perspective(1200px)_rotateX(3deg)_rotateY(3deg)_scale(1.02)]"
          )}
        >
          {/* Glass highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Cover image */}
          {story.coverImage && (
            <div className="relative h-48 overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${story.coverImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
            </div>
          )}

          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/20">
                {story.category}
              </span>
              {story.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {story.title}
            </h3>

            {story.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {story.excerpt}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {story.wordCount} words
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {story.readingTime} min read
              </span>
              <span className="flex items-center gap-1 ml-auto">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(story.createdAt)}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-border/30 group-hover:ring-accent/20 transition-all pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  )
}
