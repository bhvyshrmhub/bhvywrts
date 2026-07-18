"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, X, ImageIcon, Loader2, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { cn } from "@/lib/utils"

interface CoverImageUploadProps {
  currentImage: string | null
  onImageChange: (url: string | null) => void
}

export function CoverImageUpload({ currentImage, onImageChange }: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB")
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data, error } = await supabase.storage
        .from("covers")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName)

      setPreview(publicUrl)
      onImageChange(publicUrl)
    } catch (err) {
      console.error("Upload failed:", err)
      alert("Failed to upload image. Check that the Supabase storage bucket 'covers' exists.")
    }
    setUploading(false)
  }

  const removeImage = () => {
    setPreview(null)
    onImageChange(null)
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
        Cover Image
      </label>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border group">
          <img
            src={preview}
            alt="Cover preview"
            className="w-full aspect-[16/9] object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="p-2 rounded-lg bg-white/90 text-foreground hover:bg-white transition-colors"
              title="Replace"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={removeImage}
              className="p-2 rounded-lg bg-white/90 text-destructive hover:bg-white transition-colors"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full aspect-[16/9] rounded-lg border-2 border-dashed border-border hover:border-foreground/30 transition-colors flex flex-col items-center justify-center gap-2 bg-card",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground/50">Click to upload cover (max 5MB)</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}