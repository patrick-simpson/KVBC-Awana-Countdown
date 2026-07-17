# KVBC Awana Presentation Tool

A projector display for Wednesday-evening Awana club nights at KVBC Church.
It counts down to 6:00 PM, runs the opening ceremony slides (welcome +
pledges), themes each club's game-time window in its 2026–27 catalog color,
shows the closing slide, and shuts down for the night — all automatically,
driven by the local clock. Designed for projection on a white wall: pure
black backgrounds, high contrast, very large type.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Useful while testing: append `?now=2026-09-16T18:04:00` (any ISO time) to
time-travel the whole app; the simulated clock still ticks forward.

## Quality gates

```bash
npm run lint       # TypeScript (strict)
npm test           # vitest — schedule engine boundary cases
npm run build      # production build (fonts bundle locally)
```

## Deploy

Pushing to `main` deploys to GitHub Pages via Actions. `npm run deploy`
does a manual gh-pages push.

## Operator notes

- Hover the top-right corner for the hidden quick-nav (manual override of
  any screen; "Resume Schedule" returns control to the clock).
- Space/→ advance slides and skip the countdown; ←/PageUp go back;
  press Esc twice to leave the slideshow; Space restarts after shutdown.

## The Awana app family

This repo is the **shared-data host** for three apps that run together on
club nights:

| App | Role |
|---|---|
| [Print-TwoTimTwo-Labels](https://github.com/patrick-simpson/Print-TwoTimTwo-Labels) | Check-in label printer — the ONLY publisher on the shared Pusher channel (live counts, birthdays, replays) |
| [Awana-Check-in-Display](https://github.com/patrick-simpson/Awana-Check-in-Display) | Lobby welcome screen — celebration banners per check-in |
| **KVBC-Awana-Countdown** (this repo) | Room presentation — countdown, ceremony, game-time screens |

`shared/` here is the single source of truth they all read, published to
GitHub Pages at `…/KVBC-Awana-Countdown/shared/`:

- `shared/schedule.json` — meeting day/time, program windows, dated
  overrides (no-club weeks, special-night tables)
- `shared/theme.json` + `shared/art/` — per-club catalog colors, aliases,
  and official club art

The event-bus payloads are pinned by `src/lib/__fixtures__/contract-vectors.json`
— a byte-identical mirror of the canonical copy in the printer repo
(see its `CONTRACT.md`). `src/lib/contract.test.ts` keeps this app's
parsers conformant.

## Forking for another church

1. Edit `src/church.config.ts` — church name, weather coordinates,
   calendar feed/scrape URLs, Pusher public key, watchdog timings.
2. Edit `shared/schedule.json` — your meeting day, start time, and
   program windows (validated at build; a bad file fails the build
   instead of deploying).
3. Edit `shared/theme.json` and swap `shared/art/` — your clubs, colors
   and art. Club ids referenced by windows must exist in the theme.
4. Update the Vite `base` path in `vite.config.ts` to your repo name,
   and the sibling apps' shared URLs if you run them too.

Everything else — engine, views, tests — is church-agnostic. Pledge and
slide text lives in `src/config.ts` if you want to reword the ceremony.
