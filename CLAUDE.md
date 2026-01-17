# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Architecture

This is a React 18 check-in/habit tracking application (打卡应用) built with Vite.

**Tech Stack:** React 18, React Router v6, Vite 5

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
