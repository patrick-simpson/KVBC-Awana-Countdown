/**
 * Clubber birthdays — pure CSV parsing and week matching. Storage and
 * React wiring live in hooks/useBirthdays.ts; everything here is a
 * plain function so it can be unit-tested like the schedule engine.
 *
 * Expected CSV: one clubber per row with name, birthday, and club
 * columns (header row optional, any order if headers are present).
 * Birthday years are ignored — only month/day matter.
 */
import type { ClubId } from '../config';

export interface BirthdayEntry {
  name: string;
  /** 1–12 */
  month: number;
  /** 1–31 */
  day: number;
  club: ClubId;
}

export interface ParseResult {
  entries: BirthdayEntry[];
  /** One message per skipped row. */
  errors: string[];
}

/* ── CSV parsing ──────────────────────────────────────────────────── */

/** Split one CSV line, honoring double-quoted cells ("Smith, Jr."). */
function splitCSVLine(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/** Map any reasonable club spelling ("T&T", "Truth & Training") to an id. */
export function normalizeClub(raw: string): ClubId | null {
  const s = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('puggle')) return 'puggles';
  if (s.includes('cubbie') || s.includes('cubby')) return 'cubbies';
  if (s.includes('spark')) return 'sparks';
  if (s === 'tt' || s.includes('tnt') || s.includes('truth')) return 'tnt';
  return null;
}

const MONTH_PREFIXES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function validMonthDay(month: number, day: number): { month: number; day: number } | null {
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > DAYS_IN_MONTH[month - 1]) return null;
  return { month, day };
}

/** Accepts 9/16, 9-16, 09/16/2018, 2018-09-16, "Sep 16", "September 16, 2018". */
export function parseBirthdayDate(raw: string): { month: number; day: number } | null {
  const s = raw.trim();

  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/); // year-first ISO
  if (m) return validMonthDay(Number(m[2]), Number(m[3]));

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})(?:[-/.](\d{2,4}))?$/); // US month/day[/year]
  if (m) return validMonthDay(Number(m[1]), Number(m[2]));

  m = s.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:\s*,?\s*(\d{2,4}))?$/); // "Sep 16[, 2018]"
  if (m) {
    const idx = MONTH_PREFIXES.findIndex((p) => m![1].toLowerCase().startsWith(p));
    if (idx >= 0) return validMonthDay(idx + 1, Number(m[2]));
  }

  return null;
}

export function parseBirthdayCSV(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries: BirthdayEntry[] = [];
  const errors: string[] = [];
  if (lines.length === 0) return { entries, errors };

  // Column order defaults to name,birthday,club; an optional header row
  // (detected by keywords) can rearrange it.
  let cols = { name: 0, birthday: 1, club: 2 };
  let startIdx = 0;
  const header = splitCSVLine(lines[0]).map((c) => c.toLowerCase());
  if (header.some((h) => /name|clubber|birth|dob|club/.test(h))) {
    startIdx = 1;
    const nameIdx = header.findIndex((h) => /name|clubber|child/.test(h));
    const dateIdx = header.findIndex((h) => /birth|dob|date/.test(h));
    const clubIdx = header.findIndex((h) => /club|group|team/.test(h));
    cols = {
      name: nameIdx >= 0 ? nameIdx : 0,
      birthday: dateIdx >= 0 ? dateIdx : 1,
      club: clubIdx >= 0 ? clubIdx : 2,
    };
  }

  for (let i = startIdx; i < lines.length; i++) {
    const rowNum = i + 1;
    const cells = splitCSVLine(lines[i]);
    const name = cells[cols.name] ?? '';
    const rawDate = cells[cols.birthday] ?? '';
    const rawClub = cells[cols.club] ?? '';

    if (!name) {
      errors.push(`Row ${rowNum}: missing name`);
      continue;
    }
    const date = parseBirthdayDate(rawDate);
    if (!date) {
      errors.push(`Row ${rowNum}: unrecognized birthday "${rawDate}"`);
      continue;
    }
    const club = normalizeClub(rawClub);
    if (!club) {
      errors.push(`Row ${rowNum}: unrecognized club "${rawClub}"`);
      continue;
    }
    entries.push({ name, month: date.month, day: date.day, club });
  }

  return { entries, errors };
}

/** "Ava" · "Ava & Liam" · "Ava, Liam & Noah" — for the on-screen line. */
export function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

/* ── Week matching ────────────────────────────────────────────────── */

/** Sunday (local midnight) of the week containing `date`. */
export function weekStart(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/**
 * Entries whose birthday falls in the Sun–Sat week containing `date`,
 * ordered by day of week. The week is walked day by day, so year
 * boundaries just work; Feb 29 birthdays count on Feb 28 in common years.
 */
export function birthdaysThisWeek(entries: BirthdayEntry[], date: Date): BirthdayEntry[] {
  const start = weekStart(date);
  const days: { month: number; day: number; year: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() });
  }

  const matchIndex = (e: BirthdayEntry) =>
    days.findIndex(
      (d) =>
        (d.month === e.month && d.day === e.day) ||
        (e.month === 2 && e.day === 29 && d.month === 2 && d.day === 28 && !isLeapYear(d.year)),
    );

  return entries
    .map((e) => ({ e, idx: matchIndex(e) }))
    .filter(({ idx }) => idx >= 0)
    .sort((a, b) => a.idx - b.idx)
    .map(({ e }) => e);
}
