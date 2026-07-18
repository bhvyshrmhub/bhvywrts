"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, ImageIcon, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverImageUploadProps {
  currentImage: string | null
  onImageChange: (url: string | null) => void
}

export function CoverImageUpload({ currentImage, onImageChange }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Upload failed")
      }

      const { url } = await res.json()
      setPreview(url)
      onImageChange(url)
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Failed to upload image. Make sure you are logged in as admin.")
    }
    setUploading(false)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) uploadFile(file)
  }, [])

  const removeImage = () => {
    setPreview(null)
    onImageChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
        Cover Image
      </label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border/50 group">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full aspect-[16/9] object-cover bg-secondary"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-white/80 text-foreground hover:bg-white transition-colors"
              title="Replace"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={removeImage}
              className="p-2 rounded-lg bg-white/80 text-red-600 hover:bg-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "w-full aspect-[16/9] rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 bg-card cursor-pointer",
            dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/50">Click or drag image here (max 5MB)</span>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  )
}