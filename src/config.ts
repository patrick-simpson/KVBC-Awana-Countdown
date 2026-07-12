/**
 * Club, schedule, and slide configuration.
 * All times are local wall-clock; the meeting runs Wednesday evenings.
 */

/* ── Clubs (colors follow the 2026–27 Awana catalog) ─────────────── */

export type ClubId = 'puggles' | 'cubbies' | 'sparks' | 'tnt';

export interface Club {
  id: ClubId;
  name: string;
  /** Catalog-style audience chip, e.g. "GRADES 3–6" */
  audience: string;
  color: string;
}

export const CLUBS: Record<ClubId, Club> = {
  puggles: { id: 'puggles', name: 'Puggles', audience: 'Ages 2–3', color: '#F7941D' },
  cubbies: { id: 'cubbies', name: 'Cubbies', audience: 'Ages 3–5', color: '#0072CE' },
  sparks: { id: 'sparks', name: 'Sparks', audience: 'Grades K–2', color: '#E8192C' },
  tnt: { id: 'tnt', name: 'T&T', audience: 'Grades 3–6', color: '#00A651' },
};

/* ── Slides ───────────────────────────────────────────────────────── */

export type SlideLayout = 'celebration' | 'welcome' | 'pledge' | 'closing';
export type DeckId = 'opening' | 'closing';

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
      id: 'celebration',
      layout: 'celebration',
      title: "IT'S AWANA TIME!",
      subtitle: 'Welcome, clubbers!',
      duration: 8,
    },
    {
      id: 'welcome',
      layout: 'welcome',
      title: 'WELCOME!',
      subtitle: "We're glad you're here!",
      duration: 10,
    },
    {
      id: 'us-pledge',
      layout: 'pledge',
      title: 'Pledge of Allegiance',
      body: US_PLEDGE_TEXT,
      accentColor: '#E8192C',
      showClock: true,
    },
    {
      id: 'awana-pledge',
      layout: 'pledge',
      title: 'Awana Pledge',
      body: AWANA_PLEDGE_TEXT,
      accentColor: '#0072CE',
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

/* ── Wednesday schedule ───────────────────────────────────────────── */

export const MEETING_DAY = 3; // Wednesday
export const MEETING_START = { hour: 18, minute: 0 }; // 6:00 PM

interface WindowBase {
  title: string;
  /** Inclusive start, minutes from local midnight. */
  startMin: number;
  /** Exclusive end, minutes from local midnight. */
  endMin: number;
}

export type ScheduleWindow =
  | (WindowBase & { kind: 'slideshow'; deck: DeckId })
  | (WindowBase & { kind: 'game'; clubs: ClubId[] })
  | (WindowBase & { kind: 'shutdown' });

const MIN = (hour: number, minute: number) => hour * 60 + minute;

/**
 * The full Wednesday evening, gap-free from 18:00 to midnight.
 * The 18:00–18:05 opening window is what lets a real countdown
 * completion hold the welcome/pledge ceremony instead of being
 * yanked back to a 7-day countdown.
 */
export const WEDNESDAY_SCHEDULE: ScheduleWindow[] = [
  { kind: 'slideshow', deck: 'opening', title: 'Opening Ceremony', startMin: MIN(18, 0), endMin: MIN(18, 5) },
  { kind: 'game', title: 'T&T Game Time', clubs: ['tnt'], startMin: MIN(18, 5), endMin: MIN(18, 30) },
  { kind: 'game', title: 'Sparks Game Time', clubs: ['sparks'], startMin: MIN(18, 30), endMin: MIN(19, 0) },
  { kind: 'game', title: 'Puggles & Cubbies Game Time', clubs: ['cubbies', 'puggles'], startMin: MIN(19, 0), endMin: MIN(19, 30) },
  { kind: 'slideshow', deck: 'closing', title: 'Closing', startMin: MIN(19, 30), endMin: MIN(19, 35) },
  { kind: 'shutdown', title: 'Shutdown', startMin: MIN(19, 35), endMin: MIN(24, 0) },
];
