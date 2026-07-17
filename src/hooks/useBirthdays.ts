import { useEffect, useState } from 'react';
import { CLUBS } from '../config';
import {
  mergeLiveBirthdays,
  type BirthdayEntry,
  type LiveBirthday,
} from '../lib/birthdays';

/**
 * Birthday roster persistence. Two sources, merged for display:
 *
 * - CSV roster: uploaded through the QuickNav operator menu (manual,
 *   authoritative). localStorage `kvbc-awana-birthdays`.
 * - Live roster: auto-synced from the print server's `birthdays`
 *   Pusher broadcast (first names only). localStorage
 *   `kvbc-awana-live-birthdays`, entries stamped with receipt time and
 *   pruned after ~8 days (see lib/birthdays.mergeLiveBirthdays).
 *
 * The app has no backend; all storage access fails silently (an empty
 * roster just means no birthday chips).
 */

const STORAGE_KEY = 'kvbc-awana-birthdays';
const LIVE_STORAGE_KEY = 'kvbc-awana-live-birthdays';
const CHANGE_EVENT = 'awana:birthdays-changed';

function isValidEntry(value: unknown): value is BirthdayEntry {
  if (typeof value !== 'object' || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.name === 'string' &&
    typeof e.month === 'number' &&
    typeof e.day === 'number' &&
    typeof e.club === 'string' &&
    e.club in CLUBS
  );
}

function isValidLiveEntry(value: unknown): value is LiveBirthday {
  if (!isValidEntry(value)) return false;
  return typeof (value as unknown as Record<string, unknown>).receivedAt === 'number';
}

function loadList<T>(key: string, guard: (v: unknown) => v is T): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(guard) : [];
  } catch {
    return [];
  }
}

export function loadBirthdays(): BirthdayEntry[] {
  return loadList(STORAGE_KEY, isValidEntry);
}

export function loadLiveBirthdays(): LiveBirthday[] {
  return loadList(LIVE_STORAGE_KEY, isValidLiveEntry);
}

export function saveBirthdays(entries: BirthdayEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full/blocked — ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Replace the live roster (each broadcast carries the full current list). */
export function saveLiveBirthdays(entries: LiveBirthday[]): void {
  try {
    localStorage.setItem(LIVE_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Operator "Clear" wipes both sources. */
export function clearBirthdays(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LIVE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export interface BirthdayRoster {
  /** CSV + fresh live entries, CSV authoritative on collisions. */
  merged: BirthdayEntry[];
  csvCount: number;
  liveCount: number;
}

function buildRoster(): BirthdayRoster {
  const csv = loadBirthdays();
  const merged = mergeLiveBirthdays(csv, loadLiveBirthdays(), new Date());
  return { merged, csvCount: csv.length, liveCount: merged.length - csv.length };
}

/** Both rosters with source counts, updating live on any change (any tab). */
export function useBirthdayRoster(): BirthdayRoster {
  const [roster, setRoster] = useState<BirthdayRoster>(buildRoster);

  useEffect(() => {
    const refresh = () => setRoster(buildRoster());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return roster;
}

/** The merged roster (CSV + live), updating live on upload/clear/broadcast. */
export function useBirthdays(): BirthdayEntry[] {
  return useBirthdayRoster().merged;
}
