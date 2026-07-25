"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BarChart3, ArrowLeft, Calendar, Clock, Monitor, Smartphone, Tablet,
  Globe, ExternalLink, Search, Eye, Users, TrendingUp, BookOpen,
  RefreshCw,
} from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { cn } from "@/lib/utils"

interface Visit {
  id: string
  page: string
  path: string
  story_slug: string | null
  category: string | null
  device: string
  browser: string
  country: string | null
  referrer: string
  is_returning: boolean
  visitor_id: string
  created_at: string
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
}

function isYesterday(iso: string): boolean {
  const d = new Date(iso)
  const y = new Date()
  y.setDate(y.getDate() - 1)
  return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate()
}

function isThisWeek(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return d >= weekStart
}

function isThisMonth(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function getVisitLabel(v: Visit): string {
  if (v.page === "homepage") return "Someone opened the homepage."
  if (v.page === "stories") return "Someone opened the Stories page."
  if (v.page === "story" && v.story_slug) {
    const name = v.story_slug.replace(/-/g, " ")
    return `Someone opened "${name.charAt(0).toUpperCase() + name.slice(1)}".`
  }
  if (v.page === "dashboard") return "Someone opened the Dashboard."
  if (v.page === "editor") return "Someone opened the Editor."
  return `Someone visited ${v.path}.`
}

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
}

function StatCard({ label, value, icon: Icon, delay }: {
  label: string
  value: number | string
  icon: typeof Eye
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="p-4 md:p-5 rounded-2xl glass-card"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-purple-400" />
        </div>
      </div>
      <div className="text-2xl md:text-3xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground/60 mt-1">{label}</div>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterDevice, setFilterDevice] = useState<string>("all")
  const [filterDate, setFilterDate] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "stories" | "devices">("overview")

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/track?limit=500")
      if (res.ok) {
        const data = await res.json()
        setVisits(data)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  const filteredVisits = useMemo(() => {
    let result = [...visits]
    if (filterDate) {
      result = result.filter((v) => v.created_at.startsWith(filterDate))
    }
    if (filterDevice !== "all") {
      result = result.filter((v) => v.device === filterDevice)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) =>
          v.page.toLowerCase().includes(q) ||
          (v.story_slug && v.story_slug.toLowerCase().includes(q)) ||
          v.path.toLowerCase().includes(q) ||
          v.browser.toLowerCase().includes(q) ||
          v.referrer.toLowerCase().includes(q)
      )
    }
    return result
  }, [visits, search, filterDevice, filterDate])

  const stats = useMemo(() => {
    const totalVisits = visits.length
    const todayVisits = visits.filter((v) => isToday(v.created_at)).length
    const yesterdayVisits = visits.filter((v) => isYesterday(v.created_at)).length
    const weekVisits = visits.filter((v) => isThisWeek(v.created_at)).length
    const monthVisits = visits.filter((v) => isThisMonth(v.created_at)).length

    const uniqueVisitors = new Set(visits.map((v) => v.visitor_id)).size
    const activeVisitors = new Set(
      visits
        .filter((v) => {
          const diff = Date.now() - new Date(v.created_at).getTime()
          return diff < 5 * 60 * 1000
        })
        .map((v) => v.visitor_id)
    ).size

    return { totalVisits, todayVisits, yesterdayVisits, weekVisits, monthVisits, uniqueVisitors, activeVisitors }
  }, [visits])

  const storyStats = useMemo(() => {
    const map = new Map<string, { count: number; slug: string }>()
    visits
      .filter((v) => v.story_slug)
      .forEach((v) => {
        const key = v.story_slug!
        if (!map.has(key)) map.set(key, { count: 0, slug: key })
        map.get(key)!.count++
      })
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [visits])

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>()
    visits
      .filter((v) => v.category)
      .forEach((v) => {
        map.set(v.category!, (map.get(v.category!) || 0) + 1)
      })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [visits])

  const deviceStats = useMemo(() => {
    const map = new Map<string, number>()
    visits.forEach((v) => {
      map.set(v.device, (map.get(v.device) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [visits])

  const browserStats = useMemo(() => {
    const map = new Map<string, number>()
    visits.forEach((v) => {
      map.set(v.browser, (map.get(v.browser) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [visits])

  const referrerStats = useMemo(() => {
    const map = new Map<string, number>()
    visits.forEach((v) => {
      map.set(v.referrer, (map.get(v.referrer) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [visits])

  const recentActivity = useMemo(() => {
    return filteredVisits.slice(0, 100)
  }, [filteredVisits])

  const maxBarCount = useMemo(() => {
    return Math.max(...storyStats.map((s) => s.count), ...deviceStats.map((s) => s.count), 1)
  }, [storyStats, deviceStats])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-12 md:pt-16">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-8 md:py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-[var(--font-serif)] text-foreground flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    Website Analytics
                  </h1>
                  <p className="text-sm text-muted-foreground/60 mt-0.5">Track visitor activity and engagement</p>
                </div>
              </div>
              <button
                onClick={fetchVisits}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Refresh"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <StatCard label="Total Visits" value={stats.totalVisits} icon={Eye} delay={0} />
              <StatCard label="Today" value={stats.todayVisits} icon={Calendar} delay={0.05} />
              <StatCard label="Yesterday" value={stats.yesterdayVisits} icon={Calendar} delay={0.1} />
              <StatCard label="This Week" value={stats.weekVisits} icon={TrendingUp} delay={0.15} />
              <StatCard label="This Month" value={stats.monthVisits} icon={TrendingUp} delay={0.2} />
              <StatCard label="Active Now" value={stats.activeVisitors} icon={Users} delay={0.25} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-border/30 pb-3 overflow-x-auto">
              {(["overview", "activity", "stories", "devices"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap",
                    activeTab === tab
                      ? "glass text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Visited Stories */}
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400/60" />
                    Most Visited Stories
                  </h3>
                  {storyStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground/40 py-4 text-center">No story visits yet</p>
                  ) : (
                    <div className="space-y-3">
                      {storyStats.map((s, i) => (
                        <div key={s.slug} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground/40 w-4 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-foreground truncate capitalize">{s.slug.replace(/-/g, " ")}</div>
                            <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500/60 to-blue-500/60"
                                style={{ width: `${(s.count / maxBarCount) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground/60 shrink-0">{s.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Most Viewed Categories */}
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400/60" />
                    Most Viewed Categories
                  </h3>
                  {categoryStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground/40 py-4 text-center">No category data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {categoryStats.map((c) => {
                        const maxCat = categoryStats[0]?.count || 1
                        return (
                          <div key={c.name} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground">{c.name}</div>
                              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-cyan-500/60"
                                  style={{ width: `${(c.count / maxCat) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground/60 shrink-0">{c.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Device Breakdown */}
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-pink-400/60" />
                    Device Breakdown
                  </h3>
                  {deviceStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground/40 py-4 text-center">No device data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {deviceStats.map((d) => {
                        const DevIcon = DEVICE_ICONS[d.name] || Monitor
                        const pct = stats.totalVisits > 0 ? Math.round((d.count / stats.totalVisits) * 100) : 0
                        return (
                          <div key={d.name} className="flex items-center gap-3">
                            <DevIcon className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground capitalize">{d.name}</div>
                              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-pink-500/60 to-orange-500/60"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground/60 shrink-0">{d.count} ({pct}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Traffic Sources */}
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-400/60" />
                    Traffic Sources
                  </h3>
                  {referrerStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground/40 py-4 text-center">No referrer data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {referrerStats.map((r) => {
                        const pct = stats.totalVisits > 0 ? Math.round((r.count / stats.totalVisits) * 100) : 0
                        return (
                          <div key={r.name} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-foreground capitalize">{r.name}</div>
                              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-green-500/60 to-emerald-500/60"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground/60 shrink-0">{r.count} ({pct}%)</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search activity..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 [color-scheme:dark]"
                  />
                  <select
                    value={filterDevice}
                    onChange={(e) => setFilterDevice(e.target.value)}
                    className="px-3 py-2 rounded-xl glass text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/30 [color-scheme:dark]"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                  </select>
                </div>

                <div className="rounded-2xl glass-card overflow-hidden">
                  {recentActivity.length === 0 ? (
                    <div className="py-16 text-center">
                      <Clock className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground/40">No activity recorded yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/20">
                      {recentActivity.map((v, i) => (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(i * 0.02, 0.5) }}
                          className="px-5 py-3 flex items-start gap-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="text-xs text-muted-foreground/50 font-[var(--font-mono)] pt-0.5 w-16 shrink-0">
                            {formatTime(v.created_at)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground/80">{getVisitLabel(v)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {(() => {
                                const DevIcon = DEVICE_ICONS[v.device] || Monitor
                                return <DevIcon className="w-3 h-3 text-muted-foreground/30" />
                              })()}
                              <span className="text-[10px] text-muted-foreground/30">{v.browser}</span>
                              {v.country && (
                                <span className="text-[10px] text-muted-foreground/30">{v.country}</span>
                              )}
                              {v.referrer !== "direct" && (
                                <span className="text-[10px] text-purple-400/40">via {v.referrer}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stories Tab */}
            {activeTab === "stories" && (
              <div className="rounded-2xl glass-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Story Views</h3>
                {storyStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground/40 py-8 text-center">No story views recorded yet</p>
                ) : (
                  <div className="space-y-4">
                    {storyStats.map((s, i) => (
                      <div key={s.slug} className="flex items-center gap-4">
                        <span className="text-xs text-muted-foreground/40 w-6 text-right shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-foreground capitalize truncate">{s.slug.replace(/-/g, " ")}</span>
                            <span className="text-xs text-muted-foreground/60 shrink-0 ml-2">{s.count} views</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500/60 via-blue-500/60 to-pink-500/60 transition-all duration-500"
                              style={{ width: `${(s.count / maxBarCount) * 100}%` }}
                            />
                          </div>
                        </div>
                        <Link
                          href={`/stories/${s.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-foreground hover:bg-secondary transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Devices Tab */}
            {activeTab === "devices" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4">By Device</h3>
                  {deviceStats.map((d) => {
                    const DevIcon = DEVICE_ICONS[d.name] || Monitor
                    const pct = stats.totalVisits > 0 ? Math.round((d.count / stats.totalVisits) * 100) : 0
                    return (
                      <div key={d.name} className="flex items-center gap-3 py-2.5">
                        <DevIcon className="w-5 h-5 text-muted-foreground/50" />
                        <div className="flex-1">
                          <div className="text-sm text-foreground capitalize">{d.name}</div>
                        </div>
                        <span className="text-sm text-foreground font-medium">{d.count}</span>
                        <span className="text-xs text-muted-foreground/50 w-10 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
                <div className="rounded-2xl glass-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4">By Browser</h3>
                  {browserStats.map((b) => {
                    const pct = stats.totalVisits > 0 ? Math.round((b.count / stats.totalVisits) * 100) : 0
                    return (
                      <div key={b.name} className="flex items-center gap-3 py-2.5">
                        <Globe className="w-5 h-5 text-muted-foreground/50" />
                        <div className="flex-1">
                          <div className="text-sm text-foreground">{b.name}</div>
                        </div>
                        <span className="text-sm text-foreground font-medium">{b.count}</span>
                        <span className="text-xs text-muted-foreground/50 w-10 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
