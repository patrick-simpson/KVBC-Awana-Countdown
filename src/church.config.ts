/**
 * Everything KVBC-specific in one place. Fork this app for another
 * church by editing this file plus `shared/schedule.json` /
 * `shared/theme.json` (and swapping the art in `shared/art/`).
 *
 * Schedule windows, club names/colors, and slide text intentionally do
 * NOT live here — they come from `shared/` (see src/lib/shared-config.ts)
 * so the sibling display/printer apps read the same source of truth.
 */

export const CHURCH = {
  name: 'KVBC',

  /** Open-Meteo coordinates for the ambient weather scene. */
  coords: { lat: 44.5522, lon: -69.6317 },

  calendar: {
    /**
     * Primary: the JSON feed published nightly by the sibling
     * Awana-Check-in-Display repo's GitHub Action
     * ({version, generatedAt, events: [{date, kind, title, isCancelled, isSpecial}]}).
     */
    feedUrl: 'https://patrick-simpson.github.io/Awana-Check-in-Display/calendar-feed.json',
    /** Secondary: scrape the church calendar HTML directly (CORS-permitting). */
    scrapeUrl: 'https://kvbchurch.twotimtwo.com/site/index',
  },

  pusher: {
    /**
     * PUBLIC subscribe-only key for the shared `awana-channel` (the print
     * server holds the secret and does all publishing). Committing the
     * public key is fine — it can only listen. Leave '' to disable live
     * tally/birthday features; it can also be provided per-display via
     * `?pusherKey=...&pusherCluster=...` once (persisted in localStorage).
     */
    key: '',
    cluster: 'us2',
    channel: 'awana-channel',
  },

  watchdog: {
    /** Minutes a QuickNav override may hold the screen before auto-resume. */
    overrideTimeoutMin: 15,
    /** Seconds of on-screen warning (the "resuming in Ns" pill) before resume. */
    warningSec: 60,
  },
} as const;
