import type { Metadata } from "next"
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Source_Serif_4,
  Dancing_Script,
  IBM_Plex_Mono,
} from "next/font/google"
import { GlitterCursor } from "@/components/GlitterCursor"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
})

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
})

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Bhavy Writes | Stories, thoughts, and worlds crafted by Bhavy.",
  description:
    "A collection of stories, reflections, and imagination. A personal digital writing sanctuary.",
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${sourceSerif.variable} ${dancingScript.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <GlitterCursor />
        {children}
      </body>
    </html>
  )
}
