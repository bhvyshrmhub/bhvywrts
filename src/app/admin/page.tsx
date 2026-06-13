"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/lib/store"
import { themes } from "@/lib/themes"

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
      setError("Invalid username or password")
    }
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 border border-border/30 rounded-3xl bg-card/30 backdrop-blur-xl p-8 sm:p-10">
          <div className="text-center mb-8 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-sm text-zinc-400">Sign in to manage your stories</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                placeholder="Enter username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
