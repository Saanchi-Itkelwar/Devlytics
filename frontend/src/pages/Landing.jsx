import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Zap, Github, ArrowRight, GitCommit, Brain,
  BarChart2, GitBranch, ChevronRight,
  CheckCircle,
} from "lucide-react"

// ── Animation Variants ─────────────────────────────────────────

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
}

// ── Mock Dashboard Preview ─────────────────────────────────────

function HeatmapPreview() {
  const weeks = 20
  const days = 7
  const getColor = (v) => {
    if (v === 0) return "#1E2A3A"
    if (v === 1) return "#1e3a5f"
    if (v === 2) return "#1d5494"
    if (v === 3) return "#2563eb"
    return "#5B8CFF"
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: weeks }).map((_, w) => (
        <div key={w} className="flex flex-col gap-1">
          {Array.from({ length: days }).map((_, d) => {
            const val = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0
            return (
              <div
                key={d}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: getColor(val) }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

function MiniBarChart() {
  const data = [4, 7, 3, 9, 5, 12, 8, 6, 14, 10, 7, 11]
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1
              ? "linear-gradient(to top, #5B8CFF, #9D6BFF)"
              : "#1E2A3A",
          }}
        />
      ))}
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="bg-[#0D1320] border border-[#1E2A3A] rounded-2xl p-4 shadow-2xl shadow-black/50 w-full max-w-lg">
      {/* Top bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        <div className="flex-1 mx-2 h-5 bg-[#131929] rounded-md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Commits", value: "248", color: "#5B8CFF" },
          { label: "Repos", value: "19", color: "#9D6BFF" },
          { label: "PRs", value: "34", color: "#34D399" },
          { label: "Streak", value: "12d", color: "#F87171" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#131929] border border-[#1E2A3A] rounded-lg p-2">
            <p className="text-[9px] text-[#4A5568] mb-1">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-[#131929] border border-[#1E2A3A] rounded-lg p-3 mb-3">
        <p className="text-[9px] text-[#4A5568] mb-2">Activity Heatmap</p>
        <HeatmapPreview />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#131929] border border-[#1E2A3A] rounded-lg p-3">
          <p className="text-[9px] text-[#4A5568] mb-2">Commits / Week</p>
          <MiniBarChart />
        </div>
        <div className="bg-[#131929] border border-[#1E2A3A] rounded-lg p-3">
          <p className="text-[9px] text-[#4A5568] mb-2">Languages</p>
          <div className="space-y-1.5">
            {[
              { lang: "Python", pct: 63, color: "#5B8CFF" },
              { lang: "JS", pct: 24, color: "#9D6BFF" },
              { lang: "Go", pct: 13, color: "#34D399" },
            ].map(({ lang, pct, color }) => (
              <div key={lang}>
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-[#4A5568]">{lang}</span>
                  <span style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1 bg-[#1E2A3A] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-[#131929] border border-accent-blue/20 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
          <p className="text-[9px] text-accent-purple font-medium">AI Insight · Gemini</p>
        </div>
        <p className="text-[10px] text-white">
          🌙 You code most between 10PM–12AM. Your best day is Wednesday.
        </p>
      </div>
    </div>
  )
}

// ── Sections ───────────────────────────────────────────────────

const FEATURES = [
  {
    icon: GitCommit,
    color: "#5B8CFF",
    title: "Developer Analytics",
    description: "Track commits, pull requests, issues, and repository activity across GitHub and GitLab in one place.",
  },
  {
    icon: Brain,
    color: "#9D6BFF",
    title: "AI Productivity Insights",
    description: "Gemini AI detects your coding patterns, habits, and generates weekly summaries of your activity.",
  },
  {
    icon: GitBranch,
    color: "#34D399",
    title: "Repo Intelligence",
    description: "Discover which repositories consume the most time with per-repo commit and PR analytics.",
  },
  {
    icon: BarChart2,
    color: "#FBBF24",
    title: "Behavior Analysis",
    description: "Understand when you code, what languages you use most, and detect your peak productivity patterns.",
  },
]

const INSIGHTS = [
  {
    emoji: "🌙",
    type: "positive",
    title: "Coding Persona",
    text: "Night Owl Builder — you peak at 10PM.",
  },
  {
    emoji: "⚡",
    type: "positive",
    title: "Productivity Pattern",
    text: "You make 42% more commits on Wednesdays.",
  },
  {
    emoji: "🧠",
    type: "neutral",
    title: "Language Focus",
    text: "Python accounts for 63% of your commits.",
  },
  {
    emoji: "📈",
    type: "positive",
    title: "Efficiency Insight",
    text: "PR merge time improved 18% this month.",
  },
]

const STEPS = [
  {
    step: "01",
    title: "Connect GitHub or GitLab",
    description: "Secure OAuth integration — no passwords stored. Connect both simultaneously.",
  },
  {
    step: "02",
    title: "Devlytics analyzes your activity",
    description: "Commits, PRs, issues, and languages are fetched and processed automatically.",
  },
  {
    step: "03",
    title: "Get AI-powered insights",
    description: "Gemini AI generates your weekly digest, persona, and smart productivity insights.",
  },
]

const TYPE_COLORS = {
  positive: { border: "border-green-400/20", bg: "bg-green-400/5", badge: "text-green-400 bg-green-400/10" },
  neutral: { border: "border-accent-blue/20", bg: "bg-accent-blue/5", badge: "text-accent-blue bg-accent-blue/10" },
  warning: { border: "border-yellow-400/20", bg: "bg-yellow-400/5", badge: "text-yellow-400 bg-yellow-400/10" },
}

// ── Main Component ─────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">

      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E2A3A]/50 backdrop-blur-md bg-[#0B0F17]/80">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Devlytics</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6">
            {["Features", "Insights", "How It Works"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-muted hover:text-white transition-colors px-3 py-1.5"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              <Github size={14} />
              Connect GitHub
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={staggerItem}>
              <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                <span className="text-xs text-accent-blue font-medium">
                  AI-Powered Developer Analytics
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={staggerItem}>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Understand how you{" "}
                <span className="bg-linear-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  actually code
                </span>
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p variants={staggerItem} className="text-base text-muted leading-relaxed max-w-md">
              Devlytics connects to your GitHub and GitLab to uncover patterns
              in your development workflow, productivity, and coding behavior —
              powered by AI.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent-blue/20"
              >
                <Github size={16} />
                Connect GitHub
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 border border-[#1E2A3A] hover:border-[#2E3D54] text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                View Dashboard
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={staggerItem} className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CheckCircle size={12} className="text-green-400" />
                Free to use
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CheckCircle size={12} className="text-green-400" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <CheckCircle size={12} className="text-green-400" />
                GitHub & GitLab
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-accent-blue/10 blur-3xl rounded-full scale-75" />
              <DashboardMockup />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-[#1E2A3A]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <p className="text-xs text-accent-blue font-medium uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl font-bold">Everything you need to understand your code</h2>
            <p className="text-muted mt-3 max-w-md mx-auto text-sm">
              A complete developer observability platform built for engineers who want real insights.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {FEATURES.map(({ icon: Icon, color, title, description }) => (
              <motion.div
                key={title}
                variants={staggerItem}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="bg-[#0D1320] border border-[#1E2A3A] rounded-xl p-5 hover:border-[#2E3D54] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI Insights ───────────────────────────────── */}
      <section id="insights" className="py-24 px-6 bg-[#0D1320] border-y border-[#1E2A3A]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="text-xs text-accent-purple font-medium uppercase tracking-widest">AI Insights</p>
              <h2 className="text-3xl font-bold">
                AI that understands your{" "}
                <span className="bg-linear-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent">
                  coding habits
                </span>
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Gemini AI analyzes your commit history, PR velocity, and language patterns
                to generate personalized weekly digests and smart productivity insights.
              </p>

              <div className="space-y-2">
                {[
                  "Weekly AI digest of your development activity",
                  "Commit sentiment analysis and mood tracking",
                  "Developer persona generation with radar chart",
                  "Smart insight cards updated every 7 days",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={13} className="text-accent-purple flex-shrink-0" />
                    <span className="text-xs text-muted">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-sm text-accent-purple hover:text-white transition-colors font-medium"
              >
                See your insights
                <ChevronRight size={14} />
              </button>
            </motion.div>

            {/* Right — Insight Cards */}
            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-3"
            >
              {INSIGHTS.map((card) => {
                const style = TYPE_COLORS[card.type]
                return (
                  <motion.div
                    key={card.title}
                    variants={staggerItem}
                    className={`border ${style.border} ${style.bg} rounded-xl p-4`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{card.emoji}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
                        {card.title}
                      </span>
                    </div>
                    <p className="text-sm text-white">{card.text}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <p className="text-xs text-accent-blue font-medium uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl font-bold">Up and running in 60 seconds</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {STEPS.map(({ step, title, description }, i) => (
              <motion.div
                key={step}
                variants={staggerItem}
                className="relative"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-linear-to-r from-[#1E2A3A] to-transparent z-0" />
                )}

                <div className="bg-[#0D1320] border border-[#1E2A3A] rounded-xl p-6 relative z-10 hover:border-[#2E3D54] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-4">
                    <span className="text-xs font-bold text-accent-blue">{step}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Developer Persona ──────────────────────────── */}
      <section className="py-24 px-6 bg-[#0D1320] border-y border-[#1E2A3A]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Persona Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-[#131929] border border-[#1E2A3A] rounded-2xl p-6 max-w-sm mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-lg font-bold">
                    D
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">developer.eth</p>
                    <p className="text-xs text-muted">GitHub · 19 repos</p>
                  </div>
                </div>

                {/* Persona Badge */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                    <span className="text-xs text-accent-blue font-medium">Night Owl Builder</span>
                  </div>
                  <p className="text-xs text-muted">Your developer persona</p>
                </div>

                {/* Radar-style bars */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Consistency", value: 82, color: "#5B8CFF" },
                    { label: "Speed", value: 65, color: "#9D6BFF" },
                    { label: "Focus", value: 90, color: "#34D399" },
                    { label: "Collaboration", value: 48, color: "#FBBF24" },
                    { label: "Exploration", value: 74, color: "#F87171" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted">{label}</span>
                        <span style={{ color }}>{value}</span>
                      </div>
                      <div className="h-1.5 bg-[#1E2A3A] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Traits */}
                <div className="flex flex-wrap gap-2">
                  {["Night Owl", "Backend Builder", "Python Specialist", "Steady Contributor"].map((trait) => (
                    <span key={trait} className="text-xs bg-[#1E2A3A] text-white px-2 py-1 rounded-lg">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right text */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <p className="text-xs text-accent-purple font-medium uppercase tracking-widest">Developer Persona</p>
              <h2 className="text-3xl font-bold">
                Discover your{" "}
                <span className="bg-linear-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                  coding identity
                </span>
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Based on your commit patterns, peak hours, and language usage,
                Devlytics generates a unique developer persona that captures
                how you actually work.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Peak Time", value: "10:00 PM" },
                  { label: "Best Day", value: "Wednesday" },
                  { label: "Top Language", value: "Python" },
                  { label: "Avg Streak", value: "12 days" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#131929] border border-[#1E2A3A] rounded-xl p-3">
                    <p className="text-xs text-muted mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent-blue/20 text-sm"
              >
                Discover your persona
                <ArrowRight size={14} />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent-blue/5 blur-3xl rounded-full" />
              <div className="relative bg-[#0D1320] border border-[#1E2A3A] rounded-2xl p-10">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-6">
                  <Zap size={20} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold mb-3">
                  Start analyzing your development workflow today
                </h2>
                <p className="text-sm text-muted mb-8">
                  Connect your GitHub or GitLab account and get your first AI insights in under 2 minutes.
                </p>

                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white font-medium px-6 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent-blue/20 text-sm"
                  >
                    <Github size={16} />
                    Connect GitHub
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 border border-[#1E2A3A] hover:border-[#2E3D54] text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-[#1E2A3A] py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <Zap size={13} className="text-white" />
              </div>
              <span className="font-semibold text-sm">Devlytics</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
            {[
                { label: "Features", href: "#features" },
                { label: "Insights", href: "#insights" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Login", href: "/login" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-xs text-muted hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Devlytics. Built with FastAPI + React.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}