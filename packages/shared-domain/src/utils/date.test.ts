import { DateTime } from 'luxon';
import { generateWeeklyPeriods, getIso8601String } from './date';
describe('date.ts', () => {
  describe('getIso8601String', () => {
    it('Validate format', () => {
      const now = getIso8601String();
      // Expected example format 2022-01-01T12:00:00.000Z
      expect(now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});

describe('generateWeeklyPeriods function', () => {
  it('should return an empty array if no date is provided', () => {
    const result = generateWeeklyPeriods();
    expect(result).toEqual([]);
  });

  it('should return an array with one period when numberOfPeriods is not provided', () => {
    const result = generateWeeklyPeriods('2024-03-01');
    expect(result.length).toBe(1);
  });

  it('should return an array of weekly periods', () => {
    const result = generateWeeklyPeriods('2023-03-01', 3);

    const expectedPeriods = [
      {
        periodFrom: '2023-03-01', // Wednesday
        periodTo: '2023-03-05', // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: '2023-03-06', // Monday
        periodTo: '2023-03-12', // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: '2023-03-13', // Monday
        periodTo: '2023-03-19', // Sunday
        id: expect.any(String),
      },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should return an array with correct number of periods when number of periods is provided', () => {
    const numberOfPeriods = 5;
    const result = generateWeeklyPeriods('2023-03-01', numberOfPeriods);
    expect(result.length).toEqual(numberOfPeriods);
  });

  it('should have todays date as the last periodTo', () => {
    const today = DateTime.now().startOf('day');

    const tenDaysAgo = today.minus({ days: 10 });

    const result = generateWeeklyPeriods(tenDaysAgo.toISO(), 3);

    const lastPeriodTo = result[result.length - 1].periodTo;

    expect(lastPeriodTo).toEqual(today.toISODate());
  });
});
