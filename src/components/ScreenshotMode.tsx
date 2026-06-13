"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Camera } from "lucide-react"
import { toPng } from "html-to-image"
import { Button } from "@/components/ui/button"

interface ScreenshotModeProps {
  title: string
  excerpt: string
  author?: string
}

export function ScreenshotMode({ title, excerpt, author = "Bhavy" }: ScreenshotModeProps) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generate = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `${title.slice(0, 30).replace(/\s+/g, "-").toLowerCase()}-bhavy-writes.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error(e)
    }
    setGenerating(false)
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 rounded-full border-border/50"
      >
        <Camera className="w-4 h-4" />
        Share as Image
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-lg w-full"
            >
              <div className="absolute -top-10 right-0 flex gap-2">
                <Button
                  onClick={generate}
                  disabled={generating}
                  size="sm"
                  className="gap-2 rounded-full"
                >
                  <Download className="w-4 h-4" />
                  {generating ? "Generating..." : "Download PNG"}
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div
                ref={cardRef}
                className="relative overflow-hidden rounded-3xl p-10"
                style={{
                  background: "linear-gradient(135deg, #0f0a1a 0%, #1a0f2e 50%, #0f0a1a 100%)",
                  boxShadow: "0 0 80px rgba(167, 139, 250, 0.15)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />

                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-500/10 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-6">
                  <div className="text-xs font-medium tracking-[0.2em] uppercase text-violet-400/70">
                    Bhavy Writes
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
                    {title}
                  </h2>

                  {excerpt && (
                    <p className="text-base text-zinc-300 leading-relaxed line-clamp-4">
                      {excerpt}
                    </p>
                  )}

                  <div className="pt-4 flex items-center gap-3 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-sm font-bold text-white">
                      B
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{author}</div>
                      <div className="text-xs text-zinc-400">bhavywrites.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
