import { useCallback, useMemo, useState } from 'react';
import { WEDNESDAY_SCHEDULE } from '../config';
import { AppMode } from '../types';
import {
  getNextMeeting,
  resolveState,
  stateForWindow,
  type ResolvedState,
} from '../lib/schedule';

/** Quick-nav target: the live countdown, or one schedule window by index. */
export type NavTarget = { type: 'countdown' } | { type: 'window'; index: number };

export interface ScheduleState {
  state: ResolvedState;
  isOverride: boolean;
  /** Pin the app to a view, ignoring the clock until resume(). */
  select: (target: NavTarget) => void;
  /** Return control to the schedule. */
  resume: () => void;
}

export function useSchedule(now: Date): ScheduleState {
  const [override, setOverride] = useState<NavTarget | null>(null);

  const state = useMemo<ResolvedState>(() => {
    if (override === null) return resolveState(now);
    if (override.type === 'countdown') {
      return { mode: AppMode.COUNTDOWN, target: getNextMeeting(now) };
    }
    return stateForWindow(WEDNESDAY_SCHEDULE[override.index], now);
  }, [override, now]);

  const select = useCallback((target: NavTarget) => setOverride(target), []);
  const resume = useCallback(() => setOverride(null), []);

  return { state, isOverride: override !== null, select, resume };
}
