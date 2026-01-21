# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A check-in/habit tracking application with dual-platform support: React Web and WeChat Mini Program (微信小程序). Both platforms share business logic through a common `shared/` layer while maintaining platform-specific UI implementations.

## Commands

```bash
# Development
npm run start          # Run both frontend and backend concurrently
npm run dev            # Vite dev server only (port 5173)
npm run server         # Express backend only (port 3001)

# Build
npm run build          # Vite production build

# Testing (Playwright E2E)
npx playwright test                    # Run all tests
npx playwright test tests/app.spec.js  # Run specific test file
npx playwright test -g "打卡功能"       # Run tests matching pattern
```

## Architecture

### Dual-Platform Structure

```
shared/                 # Shared business logic (ES Modules)
├── constants/          # Categories, storage keys
├── logic/              # Date, calendar, checkin logic
└── api/                # API endpoint definitions

src/                    # React Web (uses shared/ directly)
├── adapters/           # fetch + localStorage adapters
└── pages/              # React components

miniprogram/            # WeChat Mini Program (CommonJS)
├── adapters/           # wx.request + wx.setStorageSync adapters
├── utils/shared.js     # CommonJS copy of shared logic (must be manually synced)
└── pages/              # WXML/WXSS pages

server/                 # Express + SQLite backend
├── routes/             # tasks, checkins, stats, llm endpoints
└── db.js               # better-sqlite3 database setup
```

### Key Pattern: Shared Logic Sync

When modifying `shared/` (ES Modules), you must manually sync changes to `miniprogram/utils/shared.js` (CommonJS version). The two versions must stay in sync.

### API Endpoints

- `GET/POST/PUT/DELETE /api/tasks` - Task CRUD
- `GET/POST/DELETE /api/checkins` - Check-in records
- `GET /api/stats` - Statistics (totalCheckins, streakDays, todayCheckins)
- `POST /api/llm` - LLM chat integration
- `GET /api/health` - Health check

### Database

SQLite database at `server/checkin.db` with tables:
- `tasks` (id, name, description, created_at)
- `checkins` (id, task_id, date, time, note, created_at)

### React Routing

Uses React Router with lazy-loaded pages:
- `/` - Home (stats dashboard)
- `/checkin` - Daily check-in
- `/calendar` - Monthly calendar view
- `/calendar/:date` - Day detail view
- `/records` - Check-in history

# Package Management Rules

- ALWAYS check the status of npm packages before adding/upgrading to avoid deprecated/unsupported packages while ensuring compatibility.
- use Watchman instead of Node.js libuv for file system.


