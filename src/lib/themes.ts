import type { Theme, ThemeConfig } from "@/types"

export const themes: Record<Theme, ThemeConfig> = {
  light: {
    id: "light",
    name: "Light",
    bg: "#faf6f0",
    cardBg: "rgba(255, 255, 255, 0.75)",
    text: "#1a1a2e",
    accent: "#8b5cf6",
    muted: "#6b6e85",
    border: "rgba(139, 92, 246, 0.12)",
    glow: "rgba(139, 92, 246, 0.1)",
    gradient: "from-violet-100/30 via-transparent to-fuchsia-100/30",
  },
  dark: {
    id: "dark",
    name: "Dark",
    bg: "#0b0d1a",
    cardBg: "rgba(20, 22, 50, 0.6)",
    text: "#e8e4f0",
    accent: "#a78bfa",
    muted: "#8b8fa8",
    border: "rgba(139, 92, 246, 0.15)",
    glow: "rgba(139, 92, 246, 0.15)",
    gradient: "from-violet-500/10 via-transparent to-fuchsia-500/10",
  },
}

export const getTheme = (theme: Theme) => themes[theme]
