"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, ArrowRight, Moon } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { Stars } from "@/components/Stars"

export default function AdminLoginPage() {
  const router = useRouter()
  const { isAdmin, checking, login } = useAuthStore()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { checkAuth } = useAuthStore.getState()
    checkAuth()
  }, [])

  useEffect(() => {
    if (!checking && isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, checking, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const success = await login(username, password)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials")
    }
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted)] font-[var(--font-grotesk)]">Verifying...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Stars count={26} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="glass-strong rounded-[28px] p-8 md:p-9">
          <div className="text-center mb-9">
            <div className="w-12 h-12 rounded-full glass flex items-center justify-center mx-auto mb-5">
              <Moon className="w-5 h-5 text-[var(--lavender)]" />
            </div>
            <h1 className="font-[var(--font-great-vibes)] text-3xl gradient-logo">Bhavya Writes</h1>
            <p className="text-xs text-[var(--muted)] mt-2 font-[var(--font-grotesk)] tracking-wide">
              Sign in to manage the journal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                aria-label="Username"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-foreground placeholder:text-[var(--muted)] outline-none focus:border-[var(--orchid)]/40 transition-colors text-sm"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] text-foreground placeholder:text-[var(--muted)] outline-none focus:border-[var(--orchid)]/40 transition-colors text-sm pr-11"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[var(--destructive)] text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-2xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--muted)] mt-6 font-[var(--font-grotesk)]">
          <Lock className="w-3 h-3 inline mr-1" />
          Private access — authorized only
        </p>
      </motion.div>
    </div>
  )
}
