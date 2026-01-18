# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start frontend dev server (port 5173)
npm run server   # Start backend API server (port 3001)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

This is a React 18 check-in/habit tracking application (打卡应用) built with Vite.

**Tech Stack:** React 18, React Router v6, Vite 5, Express.js, SQLite

**Routing Structure:**
- `/` - Home page
- `/calendar` - Calendar view
- `/calendar/:date` - Calendar detail for specific date
- `/checkin` - Check-in page
- `/records` - Records page

**Project Structure:**
- `src/components/` - Shared components (Layout with navigation)
- `src/pages/` - Page components (Home, Calendar, CalendarDetail, Checkin, Records)
- `src/hooks/` - Custom hooks (usePageTitle for document title management)
- `src/styles/` - Global CSS styles
- `src/api.js` - Frontend API client (tasksApi, checkinsApi, statsApi, llmApi)
- `server/` - Express.js backend
  - `server/index.js` - Main server entry point
  - `server/routes/` - API route handlers (tasks.js, checkins.js, stats.js, llm.js)
  - `server/db.js` - SQLite database connection

## Backend API

**Base URL:** `http://localhost:3001/api`

**Endpoints:**
- `GET/POST/PUT/DELETE /api/tasks` - Task management
- `GET/POST/DELETE /api/checkins` - Check-in records
- `GET /api/stats` - Statistics
- `POST /api/llm/chat` - LLM chat (modes: sync, poll, callback)
- `GET /api/llm/task/:taskId` - Poll for async LLM task result
- `GET /api/health` - Health check

## LLM Integration

The app integrates with Gemini LLM API via a backend proxy.

**Configuration (`.env`):**
```
GEMINI_KEY=your-api-key
GEMINI_API_URL=your-api-endpoint
GEMINI_MODEL=gemini-3-flash-preview
LLM_SYSTEM_PROMPT=Your system prompt here
```

**Three response modes:**
1. `sync` - Waits for complete response
2. `poll` - Returns taskId, poll `/api/llm/task/:taskId` for result
3. `callback` - Sends result to provided callbackUrl when complete

**Frontend usage:**
```javascript
import { llmApi } from './api';

// Sync mode
const response = await llmApi.chat([{role: 'user', content: 'Hello'}]);

// Poll mode
const { taskId } = await llmApi.chatAsync([{role: 'user', content: 'Hello'}]);
const result = await llmApi.getTask(taskId);
```
