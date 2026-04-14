# SkillForge — Unified Assessment Platform

A full-stack web platform for managing technical assessments, coding tests, and AI-evaluated interviews. Supports multiple roles (Super Admin, Admin, Candidate) from a single unified interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Create React App), plain CSS |
| Backend | Node.js, Express |
| Database | SQLite via `better-sqlite3` |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| AI Evaluation | LLM-based interview scoring (`llmEvaluator.js`) |
| Code Execution | Sandboxed runner (`codeExecution.js`) — supports Java |

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Quick Start (Windows)

Double-click `start_skillforge.bat`. It will:
1. Install backend and frontend dependencies
2. Build the React app
3. Start the Express server on port 3000

### Manual Start

```bash
# 1. Build the frontend
cd frontend
npm install
CI=false npm run build

# 2. Start the backend (serves the React build + API)
cd ../backend
npm install
node server.js
```

Open **http://localhost:3000** in your browser.

---

## Default Login

| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@skillforge.com | SuperAdmin@123 |

---

## Roles & Access

### Super Admin
Full platform control — visible at `/super/*`
- Dashboard with auto-refresh and live stats
- Manage admins, candidates, and test permissions
- Design and publish MCQ / coding / hybrid tests
- Set test scheduling windows (available from / until)
- View results, question analytics, and leaderboard
- Evaluate and score interview sessions
- Export interview results as CSV
- Database backup download
- Audit log viewer
- Network / LAN access settings

### Admin
Org-level management — visible at `/admin/*`
- Dashboard with candidate overview
- Manage assigned candidates
- Per-permission management (revoke / restore test access)
- View test results and leaderboard

### Candidate
Test-taking interface — visible at `/candidate/*`
- Dashboard showing assigned tests
- MCQ, coding, and hybrid test runner
  - Timer with ≤5-minute warning
  - Question flagging ("Review Later")
  - Question palette navigation
- AI-powered interview (text response only)
- Profile page
- Result review after submission

---

## Project Structure

```
skillforge_app/
├── backend/
│   ├── server.js          # Express API — all routes
│   ├── db.js              # SQLite setup + migrations
│   ├── auth.js            # JWT + bcrypt helpers
│   ├── audit.js           # Audit log helper
│   ├── questions.js       # Question set builder + shuffle
│   ├── llmEvaluator.js    # AI interview evaluator
│   ├── codeExecution.js   # Sandboxed code runner
│   ├── pdfParser.js       # PDF question import parser
│   └── skillforge.db      # SQLite database file
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.js
        │   ├── super/      # Super Admin pages
        │   ├── admin/      # Admin pages
        │   └── candidate/  # Candidate pages
        ├── styles/
        │   └── global.css  # Full design system
        └── api.js          # Axios API client
```

---

## Key Features

- **Single-port deployment** — Express serves the React build and the API on port 3000
- **LAN access** — accessible from any device on the same network via the machine's LAN IP
- **Rate limiting** — built-in in-memory rate limiter (no external packages)
- **Session expiry warning** — frontend warns candidates before their JWT expires
- **Bulk candidate import** — CSV upload for adding candidates in bulk
- **Test scheduling** — set `available_from` / `available_until` windows per test
- **Question analytics** — per-question accuracy stats for super admins
- **Audit logging** — all sensitive actions are logged with actor, role, and timestamp

---

## Environment

No `.env` file is required for local development. The backend reads configuration from `db.js` and `auth.js` directly. For production deployments, set a strong `JWT_SECRET` in `auth.js`.
