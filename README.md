# Devlytics

> **AI-powered developer analytics platform** that connects to your GitHub and GitLab to uncover patterns in your development workflow, productivity, and coding behavior.

## Overview

Devlytics is a personal developer analytics platform that gives you deep insights into your GitHub and GitLab coding activity. It combines rich data visualizations with Gemini AI to help you understand when you code, what you build, and how productive you are — all in one dark, premium dashboard.

Built as a full-stack portfolio project demonstrating AI integration, data observability, developer behavior analytics, and real SaaS-quality UX.

---

[Live Demo](https://devlyticss.netlify.app)

---

## Screenshots

### Landing Page
![Landing Page](screenshots\landing.png)

### Overview Dashboard
![Overview Dashboard](screenshots\overview.png)

### Activity Analytics
![Activity Analytics](screenshots\activity.png)

### AI Insights
![AI Insights](screenshots\ai-insights.png)

### Developer Persona
![Developer Persona](screenshots\persona.png)

### Repositories
![Repositories](screenshots\repositories.png)

---

## Features

### 📊 Dashboard & Analytics
- **Activity Heatmap** — GitHub-style contribution grid with hover tooltips
- **Commit Frequency Charts** — Weekly/monthly/yearly trends with area charts
- **Language Breakdown** — Donut chart showing language distribution across all repos
- **Coding Time Pattern** — Bar chart showing your peak coding hours throughout the day
- **Day of Week Activity** — Which days you commit most
- **PR Cycle Time** — Average time from open to merge across all repositories

### 🧠 AI & NLP Layer
- **Weekly Digest** — Gemini AI generates a natural language summary of your week
- **Smart Insight Cards** — 4 AI-generated insight cards refreshed weekly
- **Commit Sentiment Analysis** — NLP scores each commit message as positive/neutral/negative
- **Mood Timeline** — Weekly sentiment trend chart over 90 days
- **Developer Persona** — AI assigns you a persona (e.g. "Night Owl Builder") with radar chart traits
- **AI Cache System** — Results cached for 7 days, force-refresh available

### 📁 Repository Intelligence
- **Repo Table** — Sortable table with commit count, PR count, issue count per repo
- **Repo Detail Page** — Per-repo commit frequency, language breakdown, PR and issue stats
- **Fork Filtering** — Forked repos excluded from contribution counts (matches GitHub's method)

### ⚡ Productivity Tracking
- **Coding Hours Distribution** — Period-colored bar chart (Night/Morning/Afternoon/Evening)
- **Streak History** — Current and longest coding streaks with daily breakdown
- **Commit Burst Detection** — Detects days with unusually high activity (2x average)
- **Week-over-week Change** — Percentage change vs previous week

### 📜 Timeline
- **Chronological Event Feed** — Commits, PRs, and issues in one scrollable timeline
- **Date Grouping** — Events grouped by day with separator labels
- **Filtering** — Filter by event type (commits / PRs / issues)
- **Pagination** — Load more with offset-based pagination

### ⚙️ Settings
- **Profile Management** — Update display name
- **Password Change** — Secure password update for email accounts
- **Integration Management** — Connect/disconnect GitHub and GitLab
- **Manual Sync** — Trigger data resync on demand

### 🔐 Authentication
- **GitHub OAuth** — One-click login with GitHub
- **GitLab OAuth** — One-click login with GitLab
- **Email + Password** — Traditional register/login with bcrypt hashing
- **JWT Sessions** — 7-day token expiry with secure storage

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS v4, shadcn/ui |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Backend** | Python 3.11, FastAPI |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | SQLAlchemy |
| **Auth** | JWT (python-jose), bcrypt |
| **AI** | Google Gemini 2.0 Flash (google-genai) |
| **NLP** | TextBlob (commit sentiment analysis) |
| **HTTP Client** | httpx (async) |
| **DevOps** | Docker, Docker Compose, GitHub Actions, GitLab CI |
| **Deployment** | Render (backend), Netlify (frontend), Supabase (database) |

---

## Project Structure

```
devlytics/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py          # JWT + GitHub/GitLab OAuth
│   │   │   ├── analytics.py     # Chart data endpoints
│   │   │   ├── repos.py         # Repository endpoints
│   │   │   ├── sync.py          # Data ingestion trigger
│   │   │   ├── ai_insights.py   # Gemini AI + NLP endpoints
│   │   │   ├── productivity.py  # Productivity analytics
│   │   │   ├── timeline.py      # Event timeline
│   │   │   ├── settings.py      # User settings
│   │   │   └── health.py        # Health check
│   │   ├── services/
│   │   │   ├── github.py        # GitHub API ingestion
│   │   │   ├── gitlab.py        # GitLab API ingestion
│   │   │   ├── ai.py            # Gemini AI generation
│   │   │   ├── nlp.py           # TextBlob sentiment analysis
│   │   │   └── cache.py         # AI result caching (7-day TTL)
│   │   ├── auth.py              # JWT utilities
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models.py            # All ORM models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   └── main.py              # FastAPI app entry point
│   ├── tests/
│   │   ├── conftest.py          # Test fixtures (SQLite in-memory)
│   │   ├── test_health.py
│   │   ├── test_auth.py
│   │   ├── test_analytics.py
│   │   └── test_sync.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/          # Recharts chart components
│   │   │   ├── layout/          # Sidebar, Topbar
│   │   │   ├── ui/              # shadcn/ui components
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── SyncBanner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Global auth state
│   │   ├── hooks/
│   │   │   ├── useAnalytics.js  # All data fetching hooks
│   │   │   └── useSync.js       # Sync status polling
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Overview.jsx
│   │   │   ├── Activity.jsx
│   │   │   ├── Repositories.jsx
│   │   │   ├── RepoDetail.jsx
│   │   │   ├── AIInsights.jsx
│   │   │   ├── Productivity.jsx
│   │   │   ├── Timeline.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with JWT interceptor
│   │   └── utils/
│   │       └── animations.js    # Framer Motion variants
│   ├── Dockerfile
│   ├── nginx.conf
│   └── netlify.toml
│
├── .github/
│   └── workflows/
│       └── ci.yml               # Lint + test + Docker build
├── .gitlab-ci.yml
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Python 3.11+
- Docker Desktop (optional)
- A [Supabase](https://supabase.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) account for Gemini API key
- GitHub OAuth app credentials
- GitLab OAuth app credentials (optional)

### 1. Clone the repository

```bash
git clone https://github.com/Saanchi-Itkelwar/Devlytics
cd devlytics
```

---

## Environment Variables

### Backend — `backend/.env`

```env
# Supabase PostgreSQL connection string
# Found at: Supabase Dashboard → Settings → Database → URI
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your_random_secret_key_here

# https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# https://gitlab.com/-/profile/applications
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret

# https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key

# Production only
FRONTEND_URL=https://your-app.netlify.app
BACKEND_URL=https://your-api.onrender.com
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITLAB_CLIENT_ID=your_gitlab_client_id
```

### OAuth Setup

**GitHub OAuth App** → https://github.com/settings/developers → New OAuth App
```
Homepage URL:   http://localhost:5173
Callback URL:   http://localhost:8000/api/auth/github/callback
```

**GitLab OAuth App** → https://gitlab.com/-/profile/applications
```
Redirect URI:   http://localhost:8000/api/auth/gitlab/callback
Scopes:         read_user, read_api
```

---

## Running Locally

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
python -m textblob.download_corpora

# Start server
uvicorn app.main:app --reload --port 8000
```

API available at `http://localhost:8000`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App available at `http://localhost:5173`

---

## Running with Docker

### Development (with hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend | http://localhost:8000 |

---

## Database Schema

```
users               — accounts (email, OAuth tokens)
repositories        — synced repos (GitHub + GitLab)
commits             — individual commits per repo
pull_requests       — PRs with open/merge timestamps
issues              — issues with open/close timestamps
repository_languages — language percentages per repo
sync_status         — per-user sync state tracking
ai_cache            — Gemini results cached for 7 days
```

---