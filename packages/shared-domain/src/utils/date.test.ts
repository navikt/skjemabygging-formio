import { DateTime } from 'luxon';
import dateUtils, { generateWeeklyPeriods, getIso8601String } from './date';

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

describe('Month functions', () => {
  describe('toLongMonthFormat', () => {
    it('should convert date to long month format', () => {
      const date = '2024-06';
      expect(dateUtils.toLongMonthFormat(date, 'en-US')).toBe('June 2024');
      expect(dateUtils.toLongMonthFormat(date, 'nb-NO')).toBe('juni 2024');
    });

    it('should return undefined for missing date', () => {
      expect(dateUtils.toLongMonthFormat()).toBeUndefined();
    });
  });

  describe('toJSDateFromMonthSubmission', () => {
    it('should convert valid date to JS Date object', () => {
      const date = '2024-06';
      expect(dateUtils.toJSDateFromMonthSubmission(date)).toEqual(new Date(2024, 5)); // JS Date month is zero-based
    });

    it('should return undefined for missing date', () => {
      expect(dateUtils.toJSDateFromMonthSubmission()).toBeUndefined();
    });
  });

  describe('findUsedInputFormat', () => {
    it('should find the correct input format', () => {
      expect(dateUtils.findUsedInputFormat('06.2024', 'nb-NO')).toBe('MM.yyyy');
      expect(dateUtils.findUsedInputFormat('06-2024', 'nb-NO')).toBe('MM-yyyy');
    });

    it('should return undefined for invalid date', () => {
      expect(dateUtils.findUsedInputFormat('invalid-date')).toBeUndefined();
    });

    it('should return undefined for missing date', () => {
      expect(dateUtils.findUsedInputFormat()).toBeUndefined();
    });
  });

  describe('isValidInputMonth', () => {
    it('should validate correct input month format', () => {
      expect(dateUtils.isValidInputMonth('06.2024', 'nb-NO')).toBe(true);
      expect(dateUtils.isValidInputMonth('2024-05', 'nb-NO')).toBe(false);
    });

    it('should invalidate incorrect input month format', () => {
      expect(dateUtils.isValidInputMonth('invalid-date')).toBe(false);
    });

    it('should return false for missing date', () => {
      expect(dateUtils.isValidInputMonth()).toBe(false);
    });
  });

  describe('isValidMonthSubmission', () => {
    it('should validate correct submission month format', () => {
      expect(dateUtils.isValidMonthSubmission('2024-06')).toBe(true);
    });

    it('should invalidate incorrect submission month format', () => {
      expect(dateUtils.isValidMonthSubmission('invalid-date')).toBe(false);
    });

    it('should return false for missing date', () => {
      expect(dateUtils.isValidMonthSubmission()).toBe(false);
    });
  });

  describe('startOfYear', () => {
    it('should return start of the year for given year', () => {
      expect(dateUtils.startOfYear('2024').toISO()).toBe(DateTime.fromObject({ year: 2024, month: 1, day: 1 }).toISO());
    });
  });

  describe('endOfYear', () => {
    it('should return end of the year for given year', () => {
      expect(dateUtils.endOfYear('2024').toISO()).toBe(
        DateTime.fromObject({
          year: 2024,
          month: 12,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
          millisecond: 999,
        }).toISO(),
      );
    });
  });
});
