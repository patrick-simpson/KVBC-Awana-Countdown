import { describe, it, expect, beforeAll } from 'vitest';
import { AppMode } from '../types';
import { findWindow, getNextMeeting, resolveState, secondsUntil, windowEnd } from './schedule';

beforeAll(() => {
  // KVBC is in Maine; schedule math must hold across US DST transitions.
  process.env.TZ = 'America/New_York';
});

/** First Wednesday on or after the given date. */
function wednesdayAfter(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day);
  while (d.getDay() !== 3) d.setDate(d.getDate() + 1);
  return d;
}

/** A Wednesday at the given local time. */
function wedAt(hour: number, minute: number, second = 0): Date {
  const d = wednesdayAfter(2026, 8, 1); // September 2026
  d.setHours(hour, minute, second, 0);
  return d;
}

describe('findWindow / resolveState — Wednesday windows', () => {
  it('is COUNTDOWN before 6:00 PM', () => {
    expect(resolveState(wedAt(17, 59, 59)).mode).toBe(AppMode.COUNTDOWN);
  });

  it('enters the opening slideshow at exactly 6:00 PM', () => {
    const state = resolveState(wedAt(18, 0, 0));
    expect(state.mode).toBe(AppMode.SLIDESHOW);
    expect(state.mode === AppMode.SLIDESHOW && state.deck).toBe('opening');
  });

  it('holds the opening ceremony through 6:04:59', () => {
    const state = resolveState(wedAt(18, 4, 59));
    expect(state.mode).toBe(AppMode.SLIDESHOW);
  });

  it('starts T&T game time at 6:05', () => {
    const state = resolveState(wedAt(18, 5, 0));
    expect(state.mode).toBe(AppMode.GAME_TIME);
    expect(state.mode === AppMode.GAME_TIME && state.window.clubs).toEqual(['tnt']);
  });

  it('switches to Sparks at 6:30 and Puggles & Cubbies at 7:00', () => {
    const sparks = resolveState(wedAt(18, 30, 0));
    expect(sparks.mode === AppMode.GAME_TIME && sparks.window.clubs).toEqual(['sparks']);
    const pc = resolveState(wedAt(19, 0, 0));
    expect(pc.mode === AppMode.GAME_TIME && pc.window.clubs).toEqual(['cubbies', 'puggles']);
  });

  it('shows the closing deck 7:30–7:35', () => {
    const state = resolveState(wedAt(19, 30, 0));
    expect(state.mode).toBe(AppMode.SLIDESHOW);
    expect(state.mode === AppMode.SLIDESHOW && state.deck).toBe('closing');
    expect(resolveState(wedAt(19, 34, 59)).mode).toBe(AppMode.SLIDESHOW);
  });

  it('shuts down from 7:35 PM through 11:59 PM with no gap', () => {
    expect(resolveState(wedAt(19, 35, 0)).mode).toBe(AppMode.SHUTDOWN);
    expect(resolveState(wedAt(23, 59, 59)).mode).toBe(AppMode.SHUTDOWN);
  });

  it('returns to COUNTDOWN at midnight after club night', () => {
    const thuMidnight = wedAt(0, 0, 0);
    thuMidnight.setDate(thuMidnight.getDate() + 1);
    expect(resolveState(thuMidnight).mode).toBe(AppMode.COUNTDOWN);
  });
});

describe('day-of-week gate', () => {
  it('never runs the club schedule on non-Wednesdays', () => {
    for (let offset = 1; offset <= 6; offset++) {
      const d = wedAt(18, 10, 0);
      d.setDate(d.getDate() + offset);
      expect(d.getDay()).not.toBe(3);
      expect(findWindow(d)).toBeNull();
      expect(resolveState(d).mode).toBe(AppMode.COUNTDOWN);
    }
  });
});

describe('getNextMeeting', () => {
  it('targets today at 6:00 PM on a Wednesday afternoon', () => {
    const target = getNextMeeting(wedAt(17, 59, 59));
    expect(target.getDay()).toBe(3);
    expect(target.getHours()).toBe(18);
    expect(target.getDate()).toBe(wedAt(0, 0).getDate());
  });

  it('rolls to next week at exactly 6:00 PM Wednesday', () => {
    const now = wedAt(18, 0, 0);
    const target = getNextMeeting(now);
    expect(target.getTime() - now.getTime()).toBe(7 * 24 * 3600 * 1000);
  });

  it('is always in the future and always Wednesday 18:00, from any day', () => {
    for (let offset = 0; offset < 7; offset++) {
      const now = wedAt(20, 30, 0);
      now.setDate(now.getDate() + offset);
      const target = getNextMeeting(now);
      expect(target.getTime()).toBeGreaterThan(now.getTime());
      expect(target.getDay()).toBe(3);
      expect(target.getHours()).toBe(18);
      expect(target.getMinutes()).toBe(0);
    }
  });

  it('keeps 6:00 PM local across the spring-forward DST week', () => {
    // US DST begins Sunday 2026-03-08; the following Wednesday is Mar 11.
    const sunday = new Date(2026, 2, 8, 12, 0, 0);
    expect(sunday.getDay()).toBe(0);
    const target = getNextMeeting(sunday);
    expect(target.getDay()).toBe(3);
    expect(target.getDate()).toBe(11);
    expect(target.getHours()).toBe(18);
  });

  it('keeps 6:00 PM local across the fall-back DST week', () => {
    // US DST ends Sunday 2026-11-01; the following Wednesday is Nov 4.
    const sunday = new Date(2026, 10, 1, 12, 0, 0);
    expect(sunday.getDay()).toBe(0);
    const target = getNextMeeting(sunday);
    expect(target.getDay()).toBe(3);
    expect(target.getDate()).toBe(4);
    expect(target.getHours()).toBe(18);
  });

  it('rolls over year boundaries', () => {
    const newYearsEve = new Date(2026, 11, 31, 20, 0, 0);
    const target = getNextMeeting(newYearsEve);
    expect(target.getFullYear()).toBe(2027);
    expect(target.getDay()).toBe(3);
    expect(target.getHours()).toBe(18);
  });
});

describe('windowEnd / secondsUntil', () => {
  it('anchors a window end to the current day', () => {
    const now = wedAt(18, 10, 0);
    const state = resolveState(now);
    if (state.mode !== AppMode.GAME_TIME) throw new Error('expected game time');
    expect(state.endsAt.getHours()).toBe(18);
    expect(state.endsAt.getMinutes()).toBe(30);
    expect(state.endsAt.getDate()).toBe(now.getDate());
    expect(secondsUntil(state.endsAt, now)).toBe(20 * 60);
  });

  it('windowEnd handles the midnight (24:00) shutdown end', () => {
    const now = wedAt(20, 0, 0);
    const state = resolveState(now);
    if (state.mode !== AppMode.SHUTDOWN) throw new Error('expected shutdown');
    const end = windowEnd(state.window, now);
    expect(end.getDate()).not.toBe(now.getDate()); // midnight = next day 00:00
    expect(end.getHours()).toBe(0);
  });

  it('secondsUntil clamps past targets to zero', () => {
    const now = wedAt(18, 0, 0);
    const past = wedAt(17, 0, 0);
    expect(secondsUntil(past, now)).toBe(0);
  });
});
