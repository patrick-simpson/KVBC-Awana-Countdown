import { useEffect, useState } from 'react';
import { CLUBS } from '../config';
import type { BirthdayEntry } from '../lib/birthdays';

/**
 * Birthday roster persistence. The list is uploaded as a CSV through
 * the QuickNav operator menu and lives in localStorage on the display
 * machine — the app has no backend. All storage access fails silently
 * (an empty roster just means no birthday chips).
 */

const STORAGE_KEY = 'kvbc-awana-birthdays';
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

export function loadBirthdays(): BirthdayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    return Array.isArray(data) ? data.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

export function saveBirthdays(entries: BirthdayEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full/blocked — ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearBirthdays(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The stored roster, updating live on upload/clear (any tab). */
export function useBirthdays(): BirthdayEntry[] {
  const [entries, setEntries] = useState<BirthdayEntry[]>(loadBirthdays);

  useEffect(() => {
    const refresh = () => setEntries(loadBirthdays());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return entries;
}
