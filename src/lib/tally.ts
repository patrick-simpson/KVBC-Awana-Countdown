/**
 * Live check-in tally — pure parsing/lookup for the `tally` events the
 * print server publishes on the shared Pusher channel:
 *   { counts: { "<club display name>": n, ... }, total: n, at: ISO }
 * Counts are keyed by club name as the check-in system reports it, so
 * lookups go through the same club-name normalizer the birthday CSV uses.
 */
import { normalizeClub } from './birthdays';
import type { ClubId } from '../config';

export interface Tally {
  counts: Record<string, number>;
  total: number;
  at: Date;
}

const MAX_CLUB_KEYS = 30;

/** Strict-parse an incoming payload; null on anything malformed. */
export function parseTally(payload: unknown): Tally | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.counts !== 'object' || p.counts === null || Array.isArray(p.counts)) return null;

  const counts: Record<string, number> = {};
  const entries = Object.entries(p.counts as Record<string, unknown>).slice(0, MAX_CLUB_KEYS);
  for (const [club, n] of entries) {
    if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) continue;
    counts[club.slice(0, 40)] = Math.floor(n);
  }

  const total =
    typeof p.total === 'number' && Number.isFinite(p.total) && p.total >= 0
      ? Math.floor(p.total)
      : Object.values(counts).reduce((a, b) => a + b, 0);

  const at = typeof p.at === 'string' || typeof p.at === 'number' ? new Date(p.at) : null;
  if (!at || Number.isNaN(at.getTime())) return null;

  return { counts, total, at };
}

/** Tonight's count for one club id, or null when the tally doesn't cover it. */
export function countForClub(tally: Tally, clubId: ClubId): number | null {
  let found: number | null = null;
  for (const [name, n] of Object.entries(tally.counts)) {
    if (normalizeClub(name) === clubId) found = (found ?? 0) + n;
  }
  return found;
}
