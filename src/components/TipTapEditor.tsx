"use client"

import { useCallback, useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import LinkExtension from "@tiptap/extension-link"
import ImageExtension from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlock from "@tiptap/extension-code-block"
import Highlight from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { motion } from "framer-motion"
import {
  Bold, Italic, Underline as UnderlineIcon, Code, Quote, List, ListOrdered,
  Heading1, Heading2, Heading3, Image, Link, Table as TableIcon,
  Undo, Redo, Highlighter, Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditorStore } from "@/lib/store"
import { calculateReadingTime, calculateWords } from "@/lib/utils"

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const { mode } = useEditorStore()
  const setMetrics = useEditorStore((s) => s.setMetrics)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({ placeholder: "Start writing..." }),
      CodeBlock,
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      onChange(html)
      updateMetrics(ed)

      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        localStorage.setItem("bhavy-autosave", html)
      }, 3000)
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-8",
          "prose-headings:text-foreground prose-p:text-foreground/90",
          "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
          "prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
          "prose-blockquote:border-accent prose-blockquote:text-muted-foreground",
          "prose-pre:bg-card prose-pre:border prose-pre:border-border/50",
          "prose-img:rounded-xl prose-img:shadow-lg",
          mode === "focus" && "focus-mode",
          mode === "zen" && "zen-mode",
        ),
      },
    },
  })

  const updateMetrics = useCallback(
    (ed: typeof editor) => {
      if (!ed) return
      const text = ed.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const characters = text.length
      const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length || 1
      setMetrics({
        words,
        characters,
        paragraphs,
        readingTime: calculateReadingTime(text),
      })
    },
    [setMetrics]
  )

  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content])

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  if (!editor) return null

  const ToolBtn = ({ onClick, active, children, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-accent/30",
        active && "bg-accent/40 text-accent"
      )}
    >
      {children}
    </button>
  )

  const addImage = () => {
    const url = prompt("Enter image URL:")
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  const addLink = () => {
    const url = prompt("Enter URL:")
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div
      className={cn(
        "relative",
        mode === "fullscreen" && "fixed inset-0 z-50 bg-background",
        mode === "focus" && "max-w-3xl mx-auto"
      )}
    >
      <motion.div
        initial={false}
        className={cn(
          "sticky top-16 z-10 flex flex-wrap items-center gap-1 px-2 py-2 rounded-xl border border-border/30 bg-card/80 backdrop-blur-xl mb-4",
          mode === "fullscreen" && "top-0 rounded-none border-x-0"
        )}
      >
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code className="w-4 h-4" />
        </ToolBtn>

        <div className="w-px h-5 bg-border mx-1" />

        <ToolBtn onClick={addImage} title="Image">
          <Image className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={addLink} active={editor.isActive("link")} title="Link">
          <Link className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={addTable} title="Table">
          <TableIcon className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight">
          <Highlighter className="w-4 h-4" />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="w-4 h-4" />
        </ToolBtn>

        <div className="ml-auto flex items-center gap-1">
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo className="w-4 h-4" />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo className="w-4 h-4" />
          </ToolBtn>
        </div>
      </motion.div>

      <EditorContent editor={editor} />
    </div>
  )
}
