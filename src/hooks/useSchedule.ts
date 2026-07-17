import { useCallback, useEffect, useRef, useState } from 'react';
import { AppMode } from '../types';
import { CHURCH } from '../church.config';
import { SCHEDULE_CONFIG } from '../lib/shared-config';
import { evaluateOverride } from '../lib/watchdog';
import {
  getNextMeeting,
  resolveState,
  stateForWindow,
  stateKey,
  windowsForDate,
  type ResolvedState,
} from '../lib/schedule';

/** Quick-nav target: the live countdown, or one schedule window by index. */
export type NavTarget = { type: 'countdown' } | { type: 'window'; index: number };

interface Override {
  target: NavTarget;
  setAt: Date;
  /** What the schedule resolved to when the operator took over. */
  naturalKeyAtSet: string;
  lastStayAt: Date | null;
}

export interface ScheduleState {
  state: ResolvedState;
  isOverride: boolean;
  /**
   * When the watchdog will hand a window override back to the schedule
   * (null for countdown overrides — countdown is the safe default and
   * never times out). Drives the "back to schedule in Ns" pill.
   */
  resumeAt: Date | null;
  /** Pin the app to a view, ignoring the clock until resume()/watchdog. */
  select: (target: NavTarget) => void;
  /** Return control to the schedule. */
  resume: () => void;
  /** Operator "Stay" — re-arm the watchdog timeout for another full period. */
  stay: () => void;
}

export function useSchedule(now: Date): ScheduleState {
  const [override, setOverride] = useState<Override | null>(null);

  const natural = resolveState(now);
  const naturalKey = stateKey(natural);

  // The clock and natural key the callbacks should capture, without
  // re-creating the callbacks every tick.
  const liveRef = useRef({ now, naturalKey });
  liveRef.current = { now, naturalKey };

  // The window table in effect today (special dates can replace it), so
  // an override index always points into what QuickNav displayed.
  const effectiveWindows = windowsForDate(now) ?? SCHEDULE_CONFIG.windows;

  let state: ResolvedState = natural;
  let resumeAt: Date | null = null;
  let shouldResume = false;

  if (override !== null) {
    if (override.target.type === 'countdown') {
      state = { mode: AppMode.COUNTDOWN, target: getNextMeeting(now) };
      // No timeout: countdown is the safe default (this is also the
      // post-shutdown restart path). Resume when the schedule catches up
      // or crosses a boundary underneath us.
      shouldResume = naturalKey === 'countdown' || naturalKey !== override.naturalKeyAtSet;
    } else {
      const index = Math.min(override.target.index, effectiveWindows.length - 1);
      state = stateForWindow(effectiveWindows[index], now);
      const verdict = evaluateOverride({
        overrideKey: stateKey(state),
        naturalKey,
        naturalKeyAtSet: override.naturalKeyAtSet,
        setAt: override.setAt,
        lastStayAt: override.lastStayAt,
        now,
        timeoutMin: CHURCH.watchdog.overrideTimeoutMin,
      });
      resumeAt = verdict.resumeAt;
      shouldResume = verdict.action === 'resume';
    }
  }

  // State updates belong in effects, not render. When the watchdog says
  // resume, the natural state is (or is about to be) identical or newer
  // — dropping the override is at most one crossfade.
  useEffect(() => {
    if (shouldResume) setOverride(null);
  }, [shouldResume]);

  const select = useCallback((target: NavTarget) => {
    const { now: liveNow, naturalKey: liveKey } = liveRef.current;
    setOverride({ target, setAt: liveNow, naturalKeyAtSet: liveKey, lastStayAt: null });
  }, []);

  const resume = useCallback(() => setOverride(null), []);

  const stay = useCallback(() => {
    const { now: liveNow } = liveRef.current;
    setOverride((o) => (o === null ? null : { ...o, lastStayAt: liveNow }));
  }, []);

  return { state, isOverride: override !== null, resumeAt, select, resume, stay };
}
