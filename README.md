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
