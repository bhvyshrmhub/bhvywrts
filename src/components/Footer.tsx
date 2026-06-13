"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bhavy Writes. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> by Bhavy
          </div>
        </div>
      </div>
    </footer>
  )
}
