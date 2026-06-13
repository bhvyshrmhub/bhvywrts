"use client"

import dynamic from "next/dynamic"

const CursorEffect = dynamic(() => import("@/components/CursorEffect").then((m) => ({ default: m.CursorEffect })), {
  ssr: false,
})

export function CursorWrapper() {
  return <CursorEffect />
}
