import { useState } from "react"
import { Brain, RefreshCw, Sparkles, Clock } from "lucide-react"
import { motion } from "framer-motion"
import {
  useSentimentTimeline,
  useMoodSummary,
  useWeeklyDigest,
  useInsightCards,
  usePersona,
} from "../hooks/useAnalytics"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts"
import { staggerContainer, staggerItem } from "../utils/animations"
import api from "../services/api"

const TYPE_STYLES = {
  positive: {
    border: "border-green-400/20",
    bg: "bg-green-400/5",
    badge: "bg-green-400/15 text-green-400",
  },
  warning: {
    border: "border-yellow-400/20",
    bg: "bg-yellow-400/5",
    badge: "bg-yellow-400/15 text-yellow-400",
  },
  neutral: {
    border: "border-accent-blue/20",
    bg: "bg-accent-blue/5",
    badge: "bg-accent-blue/15 text-accent-blue",
  },
}

function InsightCard({ card }) {
  const style = TYPE_STYLES[card.type] || TYPE_STYLES.neutral
  return (
    <motion.div
      variants={staggerItem}
      className={`border ${style.border} ${style.bg} rounded-xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{card.emoji}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
          {card.title}
        </span>
      </div>
      <p className="text-sm text-white">{card.insight}</p>
    </motion.div>
  )
}

function CacheLabel({ generatedAt, cached }) {
  if (!generatedAt) return null
  const date = new Date(generatedAt)
  const label = date.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  })
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <Clock size={10} />
      {cached ? `Cached · generated ${label}` : `Just generated · ${label}`}
    </div>
  )
}

function PersonaRadar({ radar }) {
  const data = Object.entries(radar).map(([key, value]) => ({
    subject: key,
    value: Math.min(100, value),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#1E2A3A" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: "#4A5568" }}
        />
        <Radar
          dataKey="value"
          stroke="#5B8CFF"
          fill="#5B8CFF"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default function AIInsights() {
  const { data: sentiment, loading: sentimentLoading } = useSentimentTimeline()
  const { data: mood, loading: moodLoading } = useMoodSummary()
  const { data: digest, loading: digestLoading } = useWeeklyDigest()
  const { data: cards, meta: cardsMeta, loading: cardsLoading, refresh: refreshCards } = useInsightCards()
  const { data: persona, loading: personaLoading } = usePersona()
  const [refreshingAll, setRefreshingAll] = useState(false)

  const handleRefreshAll = async () => {
    setRefreshingAll(true)
    try {
      await api.post("/api/ai/refresh")
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshingAll(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-purple/15 flex items-center justify-center">
            <Brain size={18} className="text-accent-purple" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Insights</h2>
            <p className="text-sm text-muted">Powered by Gemini AI + NLP · refreshes weekly</p>
          </div>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={refreshingAll}
          className="flex items-center gap-2 text-xs text-muted border border-border-custom bg-surface px-3 py-2 rounded-lg hover:text-white hover:border-[#2E3D54] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshingAll ? "animate-spin" : ""} />
          {refreshingAll ? "Refreshing..." : "Force Refresh"}
        </button>
      </motion.div>

      {/* Weekly Digest */}
      <motion.div
        variants={staggerItem}
        className="bg-surface border border-border-custom rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-purple" />
            <h3 className="text-sm font-medium text-white">Weekly Digest</h3>
            <span className="text-xs bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full">
              Gemini AI
            </span>
          </div>
          <CacheLabel
            generatedAt={digest?.generated_at}
            cached={digest?.cached}
          />
        </div>

        {digestLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-border-custom rounded animate-pulse w-full" />
            <div className="h-4 bg-border-custom rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-white leading-relaxed">
            {digest?.digest || "No digest available yet."}
          </p>
        )}
      </motion.div>

      {/* Insight Cards */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Smart Insights</h3>
          <div className="flex items-center gap-3">
            <CacheLabel
              generatedAt={cardsMeta?.generated_at}
              cached={cardsMeta?.cached}
            />
            <button
              onClick={refreshCards}
              disabled={cardsLoading}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
            >
              <RefreshCw size={11} className={cardsLoading ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
        </div>

        {cardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface border border-border-custom rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {cards.map((card, i) => (
              <InsightCard key={i} card={card} />
            ))}
          </motion.div>
        ) : (
          <div className="h-24 flex items-center justify-center bg-surface border border-border-custom rounded-xl">
            <p className="text-xs text-muted">No insights yet — sync more data first</p>
          </div>
        )}
      </motion.div>

      {/* Persona + Mood */}
      <motion.div variants={staggerItem} className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Persona */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Developer Persona</h3>
          {personaLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : persona ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                  <span className="text-xs text-accent-blue font-medium">{persona.persona}</span>
                </div>
              </div>

              <PersonaRadar radar={persona.radar || {}} />

              <div className="flex flex-wrap gap-2">
                {(persona.traits || []).map((trait, i) => (
                  <span key={i} className="text-xs bg-border-custom text-white px-2 py-1 rounded-lg">
                    {trait}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "Peak Time", value: persona.peak_time },
                  { label: "Top Language", value: persona.top_language },
                  { label: "Best Day", value: persona.most_active_day },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#0B0F17] border border-border-custom rounded-lg p-2 text-center">
                    <p className="text-xs text-muted mb-0.5">{label}</p>
                    <p className="text-xs text-white font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Mood Summary */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Commit Mood Analysis</h3>
          {moodLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : mood ? (
            <div className="space-y-4">
              <div className="text-center py-2">
                <p className="text-xs text-muted mb-1">Dominant mood</p>
                <p className="text-2xl font-bold text-white capitalize">
                  {mood.dominant_mood}
                </p>
                <p className="text-xs text-muted mt-1">
                  from {mood.total_analyzed} commits analyzed
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Positive", key: "positive", bg: "bg-green-400" },
                  { label: "Neutral", key: "neutral", bg: "bg-accent-blue" },
                  { label: "Negative", key: "negative", bg: "bg-red-400" },
                ].map(({ label, key, bg }) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted">{label}</span>
                      <span className="text-white font-medium">{mood[key]}%</span>
                    </div>
                    <div className="h-1.5 bg-border-custom rounded-full overflow-hidden">
                      <div
                        className={`h-full ${bg} rounded-full transition-all duration-700`}
                        style={{ width: `${mood[key]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Sentiment Timeline */}
      <motion.div
        variants={staggerItem}
        className="bg-surface border border-border-custom rounded-xl p-5"
      >
        <h3 className="text-sm font-medium text-white mb-1">Sentiment Timeline</h3>
        <p className="text-xs text-muted mb-4">
          Weekly average commit sentiment over the past 90 days
        </p>
        {sentimentLoading ? (
          <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
        ) : sentiment.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={sentiment} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9D6BFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9D6BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#4A5568" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v)
                  return `${d.getMonth() + 1}/${d.getDate()}`
                }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#4A5568" }}
                tickLine={false}
                axisLine={false}
                domain={[-1, 1]}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#131929",
                  border: "1px solid #1E2A3A",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(v) => [v.toFixed(2), "Sentiment Score"]}
                labelFormatter={(v) => `Week of ${new Date(v).toLocaleDateString()}`}
              />
              <Area
                type="monotone"
                dataKey="avg_score"
                stroke="#9D6BFF"
                strokeWidth={2}
                fill="url(#sentimentGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#9D6BFF" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-muted">No sentiment data available yet</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}