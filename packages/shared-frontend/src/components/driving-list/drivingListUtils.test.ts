import { describe, expect, it } from 'vitest';
import { mergePeriodDates, shouldShowExpenseWarning } from './drivingListUtils';

describe('drivingListUtils', () => {
  it('merges selected dates for one period without losing other periods', () => {
    expect(
      mergePeriodDates(
        [
          { date: '2024-01-08', parking: '50', betalingsplanId: 'p1' },
          { date: '2024-01-19', parking: '', betalingsplanId: 'p2' },
        ],
        ['2024-01-09'],
        ['2024-01-08', '2024-01-09', '2024-01-10'],
        'p1',
      ),
    ).toEqual([
      { date: '2024-01-09', parking: '', betalingsplanId: 'p1' },
      { date: '2024-01-19', parking: '', betalingsplanId: 'p2' },
    ]);
  });

  it('shows refund warning when parking plus daily rates exceed refund limit', () => {
    expect(
      shouldShowExpenseWarning(
        [
          { date: '2024-01-12', parking: '100' },
          { date: '2024-01-13', parking: '100' },
        ],
        67,
        250,
      ),
    ).toBe(true);

    expect(shouldShowExpenseWarning([{ date: '2024-01-12', parking: '50' }], 67, 200)).toBe(false);
  });
});
