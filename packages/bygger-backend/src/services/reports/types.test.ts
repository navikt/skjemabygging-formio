import type { SubmissionType } from '@navikt/skjemadigitalisering-shared-domain';
import { formatReportTimestamp, formatSubmissionTypes } from './types';

describe('Report formatting', () => {
  describe('timestamps', () => {
    it.each([
      { timestamp: '2026-10-12T11:39:01.493Z', expected: '2026-10-12, 11:39:01' },
      { timestamp: '2026-10-12T11:39:01.493123Z', expected: '2026-10-12, 11:39:01' },
      { timestamp: '2026-01-01T12:00:00Z', expected: '2026-01-01, 12:00:00' },
      { timestamp: '2026-12-31T23:59:59.999Z', expected: '2026-12-31, 23:59:59' },
      { timestamp: '2026-01-01T00:30:00+01:00', expected: '2025-12-31, 23:30:00' },
      { timestamp: undefined, expected: undefined },
      { timestamp: '', expected: undefined },
    ])('formats $timestamp in UTC without fractional seconds', ({ timestamp, expected }) => {
      expect(formatReportTimestamp(timestamp)).toBe(expected);
    });

    it('rejects invalid timestamps', () => {
      expect(() => formatReportTimestamp('invalid-date')).toThrow(RangeError);
    });
  });

  describe('submission types', () => {
    it.each<{ types: SubmissionType[]; expected: string }>([
      { types: [], expected: '' },
      { types: ['PAPER'], expected: '["PAPER"]' },
      { types: ['DIGITAL', 'PAPER'], expected: '["DIGITAL", "PAPER"]' },
    ])('formats $types without displaying empty brackets', ({ types, expected }) => {
      expect(formatSubmissionTypes(types)).toBe(expected);
    });
  });
});
