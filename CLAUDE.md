# CLAUDE.md

## Project Overview

KVBC Awana Presentation Tool — a React 19 + TypeScript web app that runs on a display screen during Wednesday evening Awana club meetings at KVBC Church. It automatically cycles through a countdown timer, opening-ceremony slides (welcome + pledges), per-club game-time screens, a closing slide, and a shutdown view based on the current time. The visual design follows the 2026–27 Awana catalog language: chunky rounded display type, condensed caps, badge chips, sparkle doodles, and organic club-color waves — all over pure black.

**Live site:** Deployed to GitHub Pages at `/KVBC-Awana-Countdown/`

## Tech Stack

- **React 19** with functional components and hooks
- **TypeScript 5.8** (strict; `noEmit` for type checking)
- **Vite 8** as build tool and dev server
- **Tailwind CSS 4.2** via `@tailwindcss/vite` plugin
- **motion** (Framer Motion successor) for discrete enter/exit animation
- **lucide-react** for the few UI icons
- **@fontsource** packages — fonts bundle locally; no runtime Google Fonts requests
- **vitest** for the schedule engine tests
- **gh-pages** for manual deployment

## Development Commands

```bash
npm run dev       # Start Vite dev server on http://localhost:3000
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # TypeScript type checking (tsc --noEmit, strict)
npm test          # vitest — src/lib/schedule.test.ts
npm run deploy    # Build + deploy to GitHub Pages via gh-pages
```

**Time-travel QA:** open the app with `?now=2026-09-16T18:04:00` (any ISO timestamp) to simulate a moment in time; the simulated clock still ticks forward. This is how every schedule boundary is manually verified.

## Directory Structure

```
/
├── index.html                  # HTML entry, mounts React at #root
├── vite.config.ts              # base path, plugins, dev port
├── tsconfig.json               # strict TS
└── src/
    ├── main.tsx                # root render + last-resort ErrorBoundary
    ├── App.tsx                 # thin shell: clock → schedule → AnimatePresence view swap
    ├── index.css               # fonts + design tokens (@theme/:root) + ambient keyframes
    ├── types.ts                # AppMode enum
    ├── config.ts               # CLUBS, WEDNESDAY_SCHEDULE, slide DECKS, pledge text
    ├── lib/
    │   ├── schedule.ts         # PURE schedule engine (tested)
    │   ├── schedule.test.ts    # boundary/DST/day-gate cases
    │   ├── birthdays.ts        # PURE birthday CSV parse + Sun–Sat week match (tested)
    │   ├── birthdays.test.ts   # CSV formats, club aliases, year-boundary/Feb-29 weeks
    │   ├── motion-tokens.ts    # DUR/EASE — JS mirror of the CSS timing tokens
    │   └── color.ts            # rgbTriple (glow colors), mulberry32 (seeded scatter)
    ├── hooks/
    │   ├── useClock.ts         # single drift-corrected 1s clock + ?now= offset
    │   ├── useSchedule.ts      # resolved state + manual override (quick-nav)
    │   ├── useKeydown.ts       # shared keydown listener
    │   ├── useWeather.ts       # Open-Meteo, 15 min, silent failure
    │   ├── useCalendarEvents.ts# church calendar scrape, 30 min, CORS-proxy fallback
    │   └── useBirthdays.ts     # localStorage birthday roster + live change events
    ├── components/             # shared primitives
    │   ├── ScreenFrame.tsx     # black shell: brand bars top+bottom, scanlines, vignette
    │   ├── ClubWave.tsx        # signature catalog wave (SVG layers in club color)
    │   ├── SparkleDoodles.tsx  # seeded sparkle/star/squiggle/zigzag scatter
    │   ├── Badge.tsx           # catalog chip (+ SparkleIcon)
    │   ├── Eyebrow.tsx / GlowText.tsx   # token typography + glows
    │   ├── BigTimer.tsx / DigitReel.tsx # huge odometer timer
    │   ├── AmbientOrbs.tsx / Vignette.tsx / GlassPanel.tsx / Logo.tsx
    │   ├── EventChips.tsx      # calendar chips on Badge
    │   ├── WeatherScene.tsx / ParticleField.tsx / ConfettiBurst.tsx / BrandBar.tsx
    │   └── ViewErrorBoundary.tsx # per-view, on-brand, dependency-free fallback
    └── views/
        ├── CountdownView.tsx   # week-long countdown
        ├── GameTimeView.tsx    # per-club game window
        ├── SlideshowView.tsx / Slide.tsx  # decks with explicit slide layouts
        ├── ShutdownView.tsx
        └── QuickNav.tsx        # hidden top-right operator menu
```

## Architecture

### Pure schedule engine

All time logic lives in `src/lib/schedule.ts` as pure functions of `now`. `App.tsx` holds ONE drift-corrected 1-second clock (`useClock`) and derives the active state every tick — nothing time-related is memoized, so stale targets are impossible. The club schedule applies **only on Wednesdays** (`getDay() === 3`); any other moment resolves to COUNTDOWN.

| Wednesday window | Mode      | View          | Theme |
|------------------|-----------|---------------|-------|
| before 6:00 PM   | COUNTDOWN | CountdownView | amber wave |
| 6:00–6:05 PM     | SLIDESHOW | opening deck  | celebration → welcome → pledges |
| 6:05–6:30 PM     | GAME_TIME | GameTimeView  | T&T — green `#00A651` |
| 6:30–7:00 PM     | GAME_TIME | GameTimeView  | Sparks — red `#E8192C` |
| 7:00–7:30 PM     | GAME_TIME | GameTimeView  | Cubbies blue `#0072CE` + Puggles orange `#F7941D` |
| 7:30–7:35 PM     | SLIDESHOW | closing deck  | amber |
| 7:35 PM–midnight | SHUTDOWN  | ShutdownView  | — |

Club colors follow the **2026–27 catalog** mapping. The 6:00–6:05 opening window exists so a real countdown completion holds the ceremony instead of being reclaimed by the scheduler (this was a prominent bug in the previous implementation).

Countdown completion must observe a running→zero transition — a countdown that mounts already at zero never fires (prevents spurious confetti/mode jumps on page load).

### State management

- `useClock()` — the only timer; children receive `now` via props.
- `useSchedule(now)` — resolved state + manual override (`select`/`resume`) for the quick-nav.
- Mode changes crossfade via `AnimatePresence mode="wait"` keyed on `stateKey(state)`.
- Data hooks (`useWeather`, `useCalendarEvents`) fail silently, abort on unmount, and refetch on `visibilitychange`.

### Birthdays

The QuickNav operator menu has an "Upload Birthdays CSV" control (template: `public/birthdays-template.csv`; columns name, birthday, club — header optional, flexible date formats and club spellings). The roster persists in localStorage on the display machine (`useBirthdays`). During each club's game-time window, that week's (Sun–Sat) birthdays for the club(s) on screen show as 🎂 chips with a confetti burst. Week matching lives in `src/lib/birthdays.ts` (pure, tested — including year-boundary weeks and Feb 29).

## Design Tokens & Conventions

- **Single source of truth in `src/index.css`**: brand palette + per-club colors (`--color-club-*`), glow scale (`--glow-sm/md/lg` parameterized by `--glow-color`), timing (`--dur-*`, mirrored in `src/lib/motion-tokens.ts` — keep the two in sync), radius, and a `clamp()` type scale (`--text-timer`, `--text-pledge`, …). Never hardcode a new copy of the palette.
- **Fonts** (all local via @fontsource): Lilita One (display), Barlow Condensed 600–800 (condensed caps), Nunito Sans Variable (body), Caveat Variable (script accents).
- **Animation split:** infinite ambient loops are CSS keyframes in `@theme`; discrete enter/exit/transition animation uses `motion` with `DUR`/`EASE` tokens.
- **Keyboard:** Space/→/PageDown advance (or skip countdown); ←/PageUp back; Esc pressed twice exits the slideshow; Space/Enter/click restarts after shutdown.
- **Commit style:** Conventional commits (`feat:`, `fix:`, `build:`, `chore:`).

## External APIs

| API | URL | Auth | Refresh |
|-----|-----|------|---------|
| Open-Meteo Weather | `api.open-meteo.com` | None (free) | 15 min + visibilitychange |
| KVBC Church Calendar | `kvbchurch.twotimtwo.com` | None | 30 min + visibilitychange |
| CORS Proxy (fallback) | `api.allorigins.win` | None | On demand |

Coordinates for weather: 44.5522N, 69.6317W (KVBC location).

## Deployment

**Automatic:** Push to `main` triggers `.github/workflows/deploy.yml` (lint → test → build → GitHub Pages).

**Manual:** `npm run deploy` via the `gh-pages` npm package.

The Vite `base` path is `/KVBC-Awana-Countdown/`.

## Hardcoded Configuration

No `.env` files. Configuration lives in source:

- **Meeting day/time:** Wednesday 6:00 PM (`MEETING_DAY`/`MEETING_START` in `src/config.ts`)
- **Schedule windows / clubs / slides:** `src/config.ts`
- **Weather coordinates:** `src/hooks/useWeather.ts`
- **Calendar URL:** `src/hooks/useCalendarEvents.ts`

## Design Rules

These rules are mandatory. Every change must satisfy all three:

1. **Broadcast-ready quality.** Every screen must look polished enough for live broadcast: smooth transitions, animated effects, professional typography in the catalog language. No raw/unstyled elements, no layout jank, no abrupt state changes.

2. **Pure black backgrounds.** The app is projected onto a blank wall. All page backgrounds must be `#000000`. Component surfaces (badges, glass panels) may be near-black, but the page behind them never is anything but true black.

3. **Never revert functionality.** Changes must be additive. Do not remove, disable, or regress existing features, animations, keyboard shortcuts, or visual effects. If a feature needs to change, replace it with something equal or better.

## Important Notes for AI Assistants

- There is no committed Awana logo image; `Logo.tsx` is a typographic lockup. If an official PNG is added to `public/`, upgrade Logo to use it.
- The schedule engine is the highest-risk code — any change to `src/lib/schedule.ts` or `src/config.ts` windows needs matching cases in `schedule.test.ts`.
- Verify changes with `npm run lint`, `npm test`, and time-travel QA (`?now=`) across the 18:00, 18:05, 19:30, 19:35, and midnight boundaries, plus a non-Wednesday evening.
- The app targets a single always-on display; hover menus and keyboard shortcuts are intentional operator controls.
