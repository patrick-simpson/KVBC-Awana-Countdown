/**
 * Pure schedule engine — every function is a function of `now` alone.
 * No memoized dates, no module state: callers re-evaluate each tick,
 * so the app can never hold a stale target or fight its own scheduler.
 */
import { AppMode } from '../types';
import {
  MEETING_DAY,
  MEETING_START,
  WEDNESDAY_SCHEDULE,
  type DeckId,
  type ScheduleWindow,
} from '../config';

export type ResolvedState =
  | { mode: AppMode.COUNTDOWN; target: Date }
  | { mode: AppMode.SLIDESHOW; deck: DeckId; window: ScheduleWindow & { kind: 'slideshow' } }
  | { mode: AppMode.GAME_TIME; window: ScheduleWindow & { kind: 'game' }; endsAt: Date }
  | { mode: AppMode.SHUTDOWN; window: ScheduleWindow & { kind: 'shutdown' } };

const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

/** The schedule only applies on meeting day; every other moment is COUNTDOWN. */
export function findWindow(now: Date): ScheduleWindow | null {
  if (now.getDay() !== MEETING_DAY) return null;
  const mins = minutesOfDay(now);
  return WEDNESDAY_SCHEDULE.find((w) => mins >= w.startMin && mins < w.endMin) ?? null;
}

/** A window's end as a Date anchored to `now`'s own calendar day. */
export function windowEnd(window: ScheduleWindow, now: Date): Date {
  const end = new Date(now);
  end.setHours(Math.floor(window.endMin / 60), window.endMin % 60, 0, 0);
  return end;
}

/**
 * Next Wednesday 6:00 PM, local wall clock. Pure date-part arithmetic
 * (setHours/setDate), so DST transitions and month/year rollovers keep
 * the meeting at 18:00 local. At exactly 18:00 Wednesday the answer is
 * next week's meeting — the schedule window owns the current moment.
 */
export function getNextMeeting(now: Date): Date {
  const target = new Date(now);
  target.setHours(MEETING_START.hour, MEETING_START.minute, 0, 0);
  let daysUntil = (MEETING_DAY - now.getDay() + 7) % 7;
  if (daysUntil === 0 && target.getTime() <= now.getTime()) daysUntil = 7;
  target.setDate(now.getDate() + daysUntil);
  return target;
}

export function stateForWindow(window: ScheduleWindow, now: Date): ResolvedState {
  switch (window.kind) {
    case 'slideshow':
      return { mode: AppMode.SLIDESHOW, deck: window.deck, window };
    case 'game':
      return { mode: AppMode.GAME_TIME, window, endsAt: windowEnd(window, now) };
    case 'shutdown':
      return { mode: AppMode.SHUTDOWN, window };
  }
}

export function resolveState(now: Date): ResolvedState {
  const window = findWindow(now);
  if (!window) return { mode: AppMode.COUNTDOWN, target: getNextMeeting(now) };
  return stateForWindow(window, now);
}

/** Whole seconds until `target`, clamped at 0. */
export function secondsUntil(target: Date, now: Date): number {
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

/** Stable identity for a resolved state, for keying view transitions. */
export function stateKey(state: ResolvedState): string {
  switch (state.mode) {
    case AppMode.COUNTDOWN:
      return 'countdown';
    case AppMode.SLIDESHOW:
      return `slideshow:${state.deck}`;
    case AppMode.GAME_TIME:
      return `game:${state.window.title}`;
    case AppMode.SHUTDOWN:
      return 'shutdown';
  }
}
