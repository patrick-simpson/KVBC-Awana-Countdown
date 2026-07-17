import { describe, it, expect } from 'vitest';
import { countForClub, parseTally } from './tally';

describe('parseTally', () => {
  it('parses a well-formed print-server payload', () => {
    const t = parseTally({ counts: { 'T&T': 12, Sparks: 9 }, total: 21, at: '2026-09-02T18:20:00-04:00' });
    expect(t).not.toBeNull();
    expect(t!.counts['T&T']).toBe(12);
    expect(t!.total).toBe(21);
    expect(t!.at.getFullYear()).toBe(2026);
  });

  it('drops negative/non-numeric counts and recomputes a missing total', () => {
    const t = parseTally({ counts: { Sparks: 9, Cubbies: -3, Puggles: 'four' }, at: Date.UTC(2026, 8, 2) });
    expect(t).not.toBeNull();
    expect(t!.counts).toEqual({ Sparks: 9 });
    expect(t!.total).toBe(9);
  });

  it('rejects payloads without counts or a parseable timestamp', () => {
    expect(parseTally(null)).toBeNull();
    expect(parseTally({ total: 5, at: '2026-09-02' })).toBeNull();
    expect(parseTally({ counts: { Sparks: 1 } })).toBeNull();
    expect(parseTally({ counts: { Sparks: 1 }, at: 'tonight' })).toBeNull();
    expect(parseTally({ counts: [1, 2], at: '2026-09-02' })).toBeNull();
  });
});

describe('countForClub', () => {
  const t = parseTally({
    counts: { 'Truth & Training': 12, 'T&T': 3, Sparks: 9, Mystery: 4 },
    at: '2026-09-02T18:20:00',
  })!;

  it('normalizes club-name spellings and sums duplicates', () => {
    expect(countForClub(t, 'tnt')).toBe(15);
    expect(countForClub(t, 'sparks')).toBe(9);
  });

  it('returns null (not 0) for clubs the tally does not cover', () => {
    expect(countForClub(t, 'puggles')).toBeNull();
  });
});
