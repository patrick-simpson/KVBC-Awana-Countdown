# CLAUDE.md

## Project Overview

KVBC Awana Presentation Tool — a React 19 + TypeScript web app that runs on a display screen during Wednesday evening Awana club meetings at KVBC Church. It automatically cycles through countdown timers, pledge slides, game-time screens, and a shutdown view based on the current time.

**Live site:** Deployed to GitHub Pages at `/KVBC-Awana-Countdown/`

## Tech Stack

- **React 19** with functional components and hooks
- **TypeScript 5.8** (strict-ish, `noEmit` mode for type checking only)
- **Vite 8** as build tool and dev server
- **Tailwind CSS 4.2** via `@tailwindcss/vite` plugin
- **Lucide React** for icons
- **Motion** (formerly Framer Motion) for animations
- **gh-pages** for manual deployment

## Development Commands

```bash
npm run dev       # Start Vite dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # TypeScript type checking (tsc --noEmit)
npm run deploy    # Build + deploy to GitHub Pages via gh-pages
```

There is no test framework configured. `npm run lint` (TypeScript type check) is the only automated quality gate.

## Directory Structure

```
/
├── index.html              # HTML entry point, mounts React at #root
├── index.tsx               # React root render with ErrorBoundary
├── index.css               # Tailwind imports + custom @theme animations
├── App.tsx                 # Main orchestrator: mode switching, schedule logic, quick-nav
├── types.ts                # AppMode enum, SlideContent/ScheduleItem interfaces
├── constants.ts            # SLIDES[], SCHEDULE[], pledge text constants
│
├── components/
│   ├── CountdownView.tsx   # Countdown timer with weather, events, particles, orbs
│   ├── SlideshowView.tsx   # Pledge/intro slide viewer with keyboard navigation
│   ├── Slide.tsx           # Individual slide renderer (3 layout types)
│   ├── BrandBar.tsx        # Animated 4-color Awana brand gradient bar
│   ├── ParticleField.tsx   # Floating particle overlay (45 deterministic particles)
│   ├── WeatherScene.tsx    # Animated weather effects (rain, snow, thunder, clouds, etc.)
│   ├── EventsStrip.tsx     # Upcoming calendar events display with emoji mapping
│   └── SettingsView.tsx    # Empty placeholder (unused)
│
├── hooks/
│   ├── useWeather.ts       # Fetches weather from Open-Meteo API every 15 min
│   └── useCalendarEvents.ts # Parses church calendar HTML every 30 min
│
├── .github/workflows/
│   └── deploy.yml          # GitHub Pages deployment on push to main
│
├── docs/                   # Pre-built distribution for GitHub Pages
├── vite.config.ts          # Vite config (base path, plugins, dev server port)
├── tsconfig.json           # TypeScript config (ES2022, path alias @/*)
└── package.json            # Dependencies and scripts
```

## Architecture

### Mode-Based State Machine

The app is driven by an `AppMode` enum with four modes:

```
COUNTDOWN → GAME_TIME → SLIDESHOW → SHUTDOWN
```

`App.tsx` checks the current time every 10 seconds and selects the active mode based on `SCHEDULE` in `constants.ts`:

| Time Window       | Mode       | View            | Theme Color |
|-------------------|------------|-----------------|-------------|
| Before 6:05 PM    | COUNTDOWN  | CountdownView   | —           |
| 6:05–6:30 PM      | GAME_TIME  | CountdownView   | Red (#E8192C) — T&T |
| 6:30–7:00 PM      | GAME_TIME  | CountdownView   | Blue (#0072CE) — Sparks |
| 7:00–7:30 PM      | GAME_TIME  | CountdownView   | Green (#00A651) — Puggles & Cubbies |
| 7:30–7:35 PM      | SLIDESHOW  | SlideshowView   | — |
| 7:35 PM+          | SHUTDOWN   | ShutdownScreen  | — |

A hidden quick-nav menu (top-right, visible on hover) allows manual override of the schedule.

### Component Tree

```
App.tsx (state orchestrator)
├── CountdownView (COUNTDOWN / GAME_TIME modes)
│   ├── BrandBar
│   ├── ParticleField
│   ├── WeatherScene ← useWeather()
│   ├── EventsStrip  ← useCalendarEvents()
│   └── Ambient orbs + vignette + scanline overlays
├── SlideshowView (SLIDESHOW mode)
│   └── Slide (repeated per slide)
│       ├── BrandBar
│       └── ParticleField
└── ShutdownScreen (SHUTDOWN mode)
```

### State Management

No external state library. All state is managed with React hooks:

- `App.tsx` owns top-level state: `mode`, `activeScheduleItem`, `isManualOverride`
- Child components manage their own local state (current slide index, timer values, etc.)
- Custom hooks (`useWeather`, `useCalendarEvents`) encapsulate data fetching with polling intervals

## Code Conventions

- **Functional components only** — the sole exception is the `ErrorBoundary` class component in `App.tsx`
- **TypeScript throughout** — interfaces and enums live in `types.ts`
- **Constants centralized** in `constants.ts` (schedule, slides, pledge text)
- **Path alias:** `@/*` maps to the project root (configured in `tsconfig.json`)
- **Styling:** Tailwind utility classes for layout; inline styles for dynamic values (colors, text shadows, animation delays)
- **Custom animations** are defined in `index.css` inside the `@theme` block (gradientShift, orbitDrift, particleFloat, rainFall, snowFall, etc.)
- **Keyboard navigation:** Space/Arrow keys advance slides; Escape returns to countdown; handlers in CountdownView and SlideshowView
- **Commit style:** Conventional commits (`feat:`, `fix:`, `build:`) with descriptive messages

## Key Patterns

- **Graceful API failure:** Both `useWeather` and `useCalendarEvents` catch errors silently and fall back to defaults (clear weather, empty events). The app never crashes from failed fetches.
- **CORS proxy fallback:** `useCalendarEvents` first tries a direct fetch to the church calendar, then falls back to `allorigins.win` as a CORS proxy.
- **Deterministic animations:** `ParticleField` pre-calculates 45 particle positions/sizes so they render consistently without randomness on each render.
- **Responsive text:** Font sizes use `vw` units and `clamp()` for display-size scaling.

## External APIs

| API | URL | Auth | Refresh |
|-----|-----|------|---------|
| Open-Meteo Weather | `api.open-meteo.com` | None (free) | 15 min |
| KVBC Church Calendar | `kvbchurch.twotimtwo.com` | None | 30 min |
| CORS Proxy (fallback) | `api.allorigins.win` | None | On demand |

Coordinates for weather: 44.5522N, 69.6317W (KVBC location).

## Deployment

**Automatic:** Push to `main` triggers `.github/workflows/deploy.yml` which builds with Node 20 and deploys to GitHub Pages.

**Manual:** `npm run deploy` builds and pushes to the `gh-pages` branch via the `gh-pages` npm package.

The Vite `base` path is set to `/KVBC-Awana-Countdown/` in `vite.config.ts` for correct GitHub Pages asset paths.

## Hardcoded Configuration

There are no `.env` files. Configuration is hardcoded in source:

- **Target day/time:** Wednesday at 6:00 PM (`App.tsx`)
- **Schedule windows:** `SCHEDULE` array in `constants.ts`
- **Weather coordinates:** `useWeather.ts`
- **Calendar URL:** `useCalendarEvents.ts`
- **Awana brand colors:** Red `#E8192C`, Blue `#0072CE`, Green `#00A651`, Yellow `#FFC107`

## Design Rules

These rules are mandatory. Every change must satisfy all three:

1. **Broadcast-ready quality.** Every screen must look polished enough for live broadcast. Use smooth transitions between views, animated visual effects, and professional typography. No raw/unstyled elements, no layout jank, no abrupt state changes. New UI must match the existing production quality (neon glows, particle effects, animated orbs, brand gradients).

2. **Pure black backgrounds.** The app is projected onto a blank wall. All backgrounds must be `#000000` (true black) so the projected image appears borderless. Never use gray, dark navy, or off-black — any non-black color is visible on the wall.

3. **Never revert functionality.** Changes must be additive. Do not remove, disable, or regress existing features, animations, keyboard shortcuts, or visual effects — even when refactoring or fixing bugs. If a feature needs to change, replace it with something equal or better.

## Important Notes for AI Assistants

- The `docs/` directory contains a pre-built copy for GitHub Pages — do not edit these files directly; they are build artifacts.
- `SettingsView.tsx` is an empty placeholder and currently unused.
- The `metadata.json` file is legacy AI Studio metadata, not used by the app.
- There are no tests. When making changes, verify with `npm run lint` and manual browser testing via `npm run dev`.
- The app is designed for a single display screen, not general users — keyboard shortcuts and hover menus are intentional for operator control.
