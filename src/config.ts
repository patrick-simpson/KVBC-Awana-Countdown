/**
 * Club, schedule, and slide configuration.
 * All times are local wall-clock; the meeting runs Wednesday evenings.
 *
 * The clubs and schedule windows are DERIVED from the shared data files
 * this repo hosts for the whole Awana app family (shared/schedule.json,
 * shared/theme.json — validated in src/lib/shared-config.ts). Slide
 * decks and pledge text remain here as defaults.
 */
import { SCHEDULE_CONFIG, THEME } from './lib/shared-config';
import type { Club, ClubId, DeckId, ScheduleWindow } from './lib/shared-config';

export type { Club, ClubId, DeckId, ScheduleWindow, ScheduleConfig } from './lib/shared-config';

/* ── Clubs (colors follow the 2026–27 Awana catalog via theme.json) ── */

const CLUB_IDS: readonly ClubId[] = ['puggles', 'cubbies', 'sparks', 'tnt'];

export const CLUBS: Record<ClubId, Club> = Object.fromEntries(
  CLUB_IDS.map((id) => [id, { id, name: THEME.clubs[id].name, color: THEME.clubs[id].color }]),
) as Record<ClubId, Club>;

/* ── Slides ───────────────────────────────────────────────────────── */

export type SlideLayout = 'celebration' | 'welcome' | 'pledge' | 'closing' | 'coming-up';

export interface SlideDef {
  id: string;
  layout: SlideLayout;
  title: string;
  body?: string;
  subtitle?: string;
  /** Accent color for pledge titles etc. Defaults to white. */
  accentColor?: string;
  /** Auto-advance after this many seconds (leader can still advance manually). */
  duration?: number;
  showClock?: boolean;
}

export const US_PLEDGE_TEXT = `I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all.`;
export const AWANA_PLEDGE_TEXT = `I pledge allegiance to the Awana flag, which stands for the Awana clubs, whose goal is to reach boys and girls with the gospel of Christ, and train them to serve Him.`;

export const DECKS: Record<DeckId, SlideDef[]> = {
  opening: [
    {
      id: 'welcome',
      layout: 'celebration',
      title: 'WELCOME TO AWANA',
      duration: 10,
    },
    {
      id: 'us-pledge',
      layout: 'pledge',
      title: 'Pledge of Allegiance',
      body: US_PLEDGE_TEXT,
      accentColor: CLUBS.sparks.color,
      showClock: true,
    },
    {
      id: 'awana-pledge',
      layout: 'pledge',
      title: 'Awana Pledge',
      body: AWANA_PLEDGE_TEXT,
      accentColor: CLUBS.cubbies.color,
      showClock: true,
    },
  ],
  closing: [
    {
      id: 'goodnight',
      layout: 'closing',
      title: 'Have a great night!',
      body: 'See you next week!',
    },
  ],
};

/* ── Wednesday schedule (from shared/schedule.json) ───────────────── */

export const MEETING_DAY = SCHEDULE_CONFIG.meetingDay;
export const MEETING_START = SCHEDULE_CONFIG.meetingStart;

/**
 * The full meeting evening, gap-free from 18:00 to midnight.
 * The 18:00–18:05 opening window is what lets a real countdown
 * completion hold the welcome/pledge ceremony instead of being
 * yanked back to a 7-day countdown.
 */
export const WEDNESDAY_SCHEDULE: ScheduleWindow[] = SCHEDULE_CONFIG.windows;
