import { useEffect } from 'react';
import { getChannel } from '../lib/pusher';
import { normalizeClub, type LiveBirthday } from '../lib/birthdays';
import { saveLiveBirthdays } from './useBirthdays';

/**
 * Auto-sync this week's birthdays from the print server's `birthdays`
 * Pusher broadcast: { entries: [{ firstName, club, month, day }], at }.
 * First names only ever ride the channel (privacy contract). Each
 * broadcast carries the full current list, so storage is replaced, not
 * accumulated. Mount once at app level; consumers read via useBirthdays.
 */
export function useBirthdaySync(): void {
  useEffect(() => {
    const channel = getChannel();
    if (!channel) return;

    const onBirthdays = (payload: unknown) => {
      const parsed = parseBirthdayBroadcast(payload);
      if (parsed) saveLiveBirthdays(parsed);
    };
    channel.bind('birthdays', onBirthdays);
    return () => {
      channel.unbind('birthdays', onBirthdays);
    };
  }, []);
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function parseBirthdayBroadcast(payload: unknown): LiveBirthday[] | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const raw = (payload as Record<string, unknown>).entries;
  if (!Array.isArray(raw)) return null;

  const receivedAt = Date.now();
  const entries: LiveBirthday[] = [];
  for (const item of raw.slice(0, 60)) {
    if (typeof item !== 'object' || item === null) continue;
    const e = item as Record<string, unknown>;
    if (typeof e.firstName !== 'string' || e.firstName.trim().length === 0) continue;
    if (typeof e.club !== 'string') continue;
    const club = normalizeClub(e.club);
    if (!club) continue;
    if (typeof e.month !== 'number' || typeof e.day !== 'number') continue;
    const month = Math.floor(e.month);
    const day = Math.floor(e.day);
    if (month < 1 || month > 12 || day < 1 || day > DAYS_IN_MONTH[month - 1]) continue;
    entries.push({ name: e.firstName.trim().slice(0, 40), month, day, club, receivedAt });
  }
  return entries;
}
