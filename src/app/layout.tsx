import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { CursorWrapper } from "@/components/CursorWrapper"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Bhavy Writes | Stories, thoughts, and worlds crafted by Bhavy.",
  description: "A collection of stories, reflections, and imagination. A personal digital writing sanctuary.",
  openGraph: {
    title: "Bhavy Writes",
    description: "Stories, thoughts, and worlds crafted by Bhavy.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <CursorWrapper />
      </body>
    </html>
  )
}
