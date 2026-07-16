"use client"

import { Search } from "lucide-react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search stories..." }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-11 h-12 rounded-2xl",
          "bg-white/5 dark:bg-white/[0.03]",
          "border border-white/10",
          "backdrop-blur-xl",
          "text-foreground placeholder:text-muted-foreground/30",
          "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50",
          "transition-all duration-300",
          "group-hover:border-white/20",
          "shadow-sm"
        )}
      />
      <motion.div
        initial={false}
        animate={{ opacity: value ? 1 : 0, scale: value ? 1 : 0.9 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/30 pointer-events-none"
      >
        {value && <span>{value.length} chars</span>}
      </motion.div>
    </motion.div>
  )
}