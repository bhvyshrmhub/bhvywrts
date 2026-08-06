import type { Metadata, Viewport } from "next"
import {
  Geist_Mono,
  Instrument_Serif,
  Inter,
  Space_Grotesk,
  Source_Serif_4,
  Great_Vibes,
} from "next/font/google"
import { Background } from "@/components/Background"
import { CursorWrapper } from "@/components/CursorWrapper"
import { VisitTracker } from "@/components/VisitTracker"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
})

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
})

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Bhavya Writes — A Digital Journal",
    template: "%s — Bhavya Writes",
  },
  description:
    "A personal writing sanctuary. Stories, thoughts, and worlds crafted by Bhavya — written under the moonlight.",
  keywords: ["Bhavya Writes", "stories", "journal", "writing", "poetry", "thoughts"],
  openGraph: {
    type: "website",
    siteName: "Bhavya Writes",
    title: "Bhavya Writes",
    description: "A personal writing sanctuary. Stories and thoughts written under the moonlight.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bhavya Writes",
    description: "A personal writing sanctuary.",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} ${sourceSerif.variable} ${greatVibes.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased bg-[#000000]">
        <Background />
        <CursorWrapper />
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}
