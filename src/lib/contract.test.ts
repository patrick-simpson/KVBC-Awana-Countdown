import { describe, expect, it } from 'vitest';
import vectors from './__fixtures__/contract-vectors.json';
import { parseTally, countForClub } from './tally';

/**
 * Contract conformance — this repo consumes `tally` and `birthdays`
 * from the shared Pusher channel. The vectors file is a byte-identical
 * mirror of the canonical copy in Print-TwoTimTwo-Labels; these tests
 * pin our parsers to it so producer/consumer drift breaks a build
 * instead of a club night.
 */
describe('contract vectors', () => {
  it('is contract v2 on awana-channel', () => {
    expect(vectors.contractVersion).toBe(2);
    expect(vectors.channel).toBe('awana-channel');
  });

  it('covers the events this app consumes', () => {
    expect(Object.keys(vectors.events)).toEqual(
      expect.arrayContaining(['tally', 'birthdays']),
    );
  });
});

describe('parseTally against the vectors', () => {
  for (const [i, valid] of vectors.events.tally.valid.entries()) {
    it(`accepts tally.valid[${i}]`, () => {
      const t = parseTally(valid);
      expect(t).not.toBeNull();
      expect(t!.total).toBe(valid.total);
      for (const [club, n] of Object.entries(valid.counts)) {
        expect(t!.counts[club]).toBe(n);
      }
    });
  }

  for (const [i, rej] of vectors.events.tally.reject.entries()) {
    it(`rejects tally.reject[${i}]: ${rej.reason}`, () => {
      expect(parseTally(rej.payload)).toBeNull();
    });
  }

  it('scrubs the dirty vector (PII can never ride a tally)', () => {
    for (const dirty of vectors.events.tally.dirty) {
      const t = parseTally(dirty.payload);
      const raw = JSON.stringify(t ?? null);
      for (const banned of dirty.mustNotContain ?? []) {
        expect(raw).not.toContain(banned);
      }
    }
  });

  it('resolves club counts through the alias normalizer', () => {
    const t = parseTally(vectors.events.tally.valid[0]);
    expect(t).not.toBeNull();
    expect(countForClub(t!, 'tnt')).toBe(19);
    expect(countForClub(t!, 'sparks')).toBe(12);
  });
});

describe('birthdays vectors match the consumer shape', () => {
  it('valid entries carry exactly firstName/club/month/day', () => {
    for (const valid of vectors.events.birthdays.valid) {
      for (const entry of valid.entries) {
        expect(Object.keys(entry).sort()).toEqual(['club', 'day', 'firstName', 'month']);
        expect(entry.month).toBeGreaterThanOrEqual(1);
        expect(entry.month).toBeLessThanOrEqual(12);
      }
    }
  });
});
