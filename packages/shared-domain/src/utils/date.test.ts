import { DateTime } from 'luxon';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import dateUtils, { generateWeeklyPeriods, getIso8601String } from './date';

describe('date.ts', () => {
  describe('getIso8601String', () => {
    it('Validate format', () => {
      const now = getIso8601String();
      // Expected example format 2022-01-01T12:00:00.000Z
      expect(now).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('toCurrentDayMonthYearHourMinute', () => {
    it('should format date time string as DD Month YYYY, HH:MM', () => {
      const date = new Date();
      const year = date.getFullYear();
      const minutes = String(date.getMinutes()).padStart(2, '0');

      const formattedDate = dateUtils.toCurrentDayMonthYearHourMinute('nb');
      expect(formattedDate).contains(year);
      expect(formattedDate).contains(`:${minutes}`);
    });
  });

  describe('toLocaleDateAndTime', () => {
    describe('date with five fractional second digits', () => {
      it('should format date and time correctly for locale nb', () => {
        const date = '2020-06-24T10:00:00.625417+02:00';
        const formattedDate = dateUtils.toLocaleDateAndTime(date, 'nb');
        expect(formattedDate).toBe('24.06.2020, 10:00');
      });

      it('should format date and time correctly for locale en', () => {
        const date = '2020-06-24T10:00:00.625417+02:00';
        const formattedDate = dateUtils.toLocaleDateAndTime(date, 'en');
        expect(formattedDate).toBe('06/24/2020, 10:00 AM');
      });

      it('should format utc date and time correctly for locale en', () => {
        const date = '2020-06-24T10:00:00.625417Z';
        const formattedDate = dateUtils.toLocaleDateAndTime(date, 'en');
        expect(formattedDate).toBe('06/24/2020, 12:00 PM');
      });

      it('should format utc date and time correctly for locale nb', () => {
        const date = '2020-06-24T10:00:00.625417Z';
        const formattedDate = dateUtils.toLocaleDateAndTime(date, 'nb');
        expect(formattedDate).toBe('24.06.2020, 12:00');
      });
    });

    it('should format date and time correctly for default locale', () => {
      const date = '2024-03-01T13:00:00.000+01';
      const formattedDate = dateUtils.toLocaleDateAndTime(date);
      expect(formattedDate).toBe('01.03.2024, 13:00');
    });

    it('should format utc date and time correctly for default locale', () => {
      const date = '2024-03-01T12:00:00.000Z';
      const formattedDate = dateUtils.toLocaleDateAndTime(date);
      expect(formattedDate).toBe('01.03.2024, 13:00');
    });

    it('should format utc date and time correctly for specified locale', () => {
      const date = '2024-03-01T15:12:22.000Z';
      const formattedDate = dateUtils.toLocaleDateAndTime(date, 'en');
      expect(formattedDate).toBe('03/01/2024, 04:12 PM');
    });

    it('should return "Invalid DateTime" for invalid date', () => {
      const date = 'invalid-date';
      const formattedDate = dateUtils.toLocaleDateAndTime(date);
      expect(formattedDate).toBe('Invalid DateTime');
    });
  });

  describe('formatUnixEpochToLocalTime', () => {
    it('should format time correctly', () => {
      expect(dateUtils.formatUnixEpochSecondsToLocalTime(1764651688)).toBe('06.01');
      expect(dateUtils.formatUnixEpochSecondsToLocalTime(1764616370)).toBe('20.12');
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

    describe('getDefaultDateFromRange', () => {
      let now: DateTime;
      let lastYearDate: DateTime;
      let nextYearDate: DateTime;

      beforeAll(() => {
        vi.useFakeTimers();
      });

      afterAll(() => {
        vi.useRealTimers();
      });

      beforeEach(() => {
        now = DateTime.now();
        lastYearDate = now.minus({ year: 1, month: 2 });
        nextYearDate = now.plus({ year: 1, month: 2 });
      });

      it('returns undefined if range is invalid', () => {
        expect(dateUtils.getDefaultDateFromRange(nextYearDate.toString(), lastYearDate.toString())).toBeUndefined();
        expect(dateUtils.getDefaultDateFromRange(lastYearDate.toString(), undefined)).toBeUndefined();
        expect(dateUtils.getDefaultDateFromRange(undefined, nextYearDate.toString())).toBeUndefined();
      });

      describe('When inputs are dateStrings', () => {
        it('returns current date if it is within the range', () => {
          expect(dateUtils.getDefaultDateFromRange(lastYearDate.toString(), nextYearDate.toString())).toEqual(
            now.toJSDate(),
          );
        });

        it('returns toDate as JSDate if the range is in the past', () => {
          const expected = lastYearDate.toJSDate();
          const actual = dateUtils.getDefaultDateFromRange(
            lastYearDate.minus({ year: 10 }).toString(),
            lastYearDate.toString(),
          );
          expect(actual?.valueOf()).not.toBeNaN();
          expect(actual).toEqual(expected);
        });

        it('returns fromDate as JSDate if the range is in the future', () => {
          const expected = nextYearDate.toJSDate();
          const actual = dateUtils.getDefaultDateFromRange(
            nextYearDate.toString(),
            nextYearDate.plus({ year: 10 }).toString(),
          );
          expect(actual?.valueOf()).not.toBeNaN();
          expect(actual).toEqual(expected);
        });
      });

      describe('With year as input', () => {
        let lastYear: number;
        let nextYear: number;

        beforeEach(() => {
          lastYear = lastYearDate.year;
          nextYear = nextYearDate.year;
        });

        it('returns current date if it is within the range', () => {
          expect(dateUtils.getDefaultDateFromRange(lastYear.toString(), nextYear.toString())).toEqual(now.toJSDate());
        });

        it('return value has same year as toDate, if the range is in the past', () => {
          expect(
            dateUtils.getDefaultDateFromRange((lastYear - 10).toString(), lastYear.toString())?.getFullYear(),
          ).toEqual(lastYear);
        });

        it('return value has same year as fromDate, if the range is in the future', () => {
          expect(
            dateUtils.getDefaultDateFromRange(nextYear.toString(), (nextYear + 10).toString())?.getFullYear(),
          ).toEqual(nextYear);
        });
      });

      describe('With yyyy-MM as input', () => {
        let lastYearMonthInput: string;
        let inThePastYearMonthInput: string;
        let nextYearMonthInput: string;
        let inTheFutureYearMonthInput: string;

        beforeEach(() => {
          lastYearMonthInput = `${lastYearDate.year}-04`;
          inThePastYearMonthInput = `${lastYearDate.minus({ year: 10 }).year}-04`;
          nextYearMonthInput = `${nextYearDate.year}-07`;
          inTheFutureYearMonthInput = `${nextYearDate.plus({ year: 10 }).year}-07`;
        });

        it('returns current date if it is within the range', () => {
          expect(dateUtils.getDefaultDateFromRange(lastYearMonthInput, nextYearMonthInput)).toEqual(now.toJSDate());
        });

        it('return value has same month and year as toDate, if the range is in the past', () => {
          const expected = DateTime.fromISO(lastYearMonthInput).toJSDate();
          const actual = dateUtils.getDefaultDateFromRange(inThePastYearMonthInput, lastYearMonthInput);
          expect(actual?.valueOf()).not.toBeNaN();
          expect(actual).toEqual(expected);
        });

        it('return value has same month and year as fromDate, if the range is in the future', () => {
          const expected = DateTime.fromISO(nextYearMonthInput).toJSDate();
          const actual = dateUtils.getDefaultDateFromRange(nextYearMonthInput, inTheFutureYearMonthInput);
          expect(actual?.valueOf()).not.toBeNaN();
          expect(actual).toEqual(expected);
        });
      });
    });

    describe('startOfYear', () => {
      it('should return start of the year for given year', () => {
        expect(dateUtils.startOfYear('2024').toISO()).toBe(
          DateTime.fromObject({ year: 2024, month: 1, day: 1 }).toISO(),
        );
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

  describe('isAfter', () => {
    describe('when date is valid', () => {
      it('should return true if date is slightly after the second date in different time zones', () => {
        const date1 = '2023-03-01T11:00:00.001+01:00'; // UTC+1
        const date2 = '2023-03-01T10:00:00.000Z'; // UTC
        expect(dateUtils.isAfter(date1, date2)).toBe(true);
      });

      it('should return false if date is before the second date in different time zones', () => {
        const date1 = '2023-03-01T08:00:00+01:00'; // UTC+1
        const date2 = '2023-03-01T10:00:00Z'; // UTC
        expect(dateUtils.isAfter(date1, date2)).toBe(false);
      });

      it('should return false if the dates are the same but in different time zones', () => {
        const date1 = '2023-03-01T10:00:00+01:00'; // UTC+1
        const date2 = '2023-03-01T09:00:00Z'; // UTC
        expect(dateUtils.isAfter(date1, date2)).toBe(false);
      });

      it('should return true when compared to date in different time zone', () => {
        const date1 = '2023-03-01T09:30:00.165Z'; // UTC
        const date2 = '2023-03-01T10:00:00.123+01:00'; // UTC+1
        expect(dateUtils.isAfter(date1, date2)).toBe(true);
      });

      it('should return true if it is after the second date with different timestamps', () => {
        const date1 = '2023-03-01T12:00:00Z';
        const date2 = '2023-03-01T11:59:59Z';
        expect(dateUtils.isAfter(date1, date2)).toBe(true);
      });

      it('should return false if it is before the second date with different timestamps', () => {
        const date1 = '2023-03-01T11:59:59Z';
        const date2 = '2023-03-01T12:00:00Z';
        expect(dateUtils.isAfter(date1, date2)).toBe(false);
      });

      it('should return true when compared to invalid date', () => {
        const date1 = '2023-03-01T11:59:59Z';
        const date2Invalid = '2023-02-99T12:00:00Z';
        expect(dateUtils.isAfter(date1, date2Invalid)).toBe(true);
      });

      it('should return true when compared to empty date string', () => {
        const date1 = '2023-03-01T11:59:59Z';
        const date2Invalid = '';
        expect(dateUtils.isAfter(date1, date2Invalid)).toBe(true);
      });
    });

    describe('when date is invalid', () => {
      it('should return false when compared to valid date', () => {
        const date1Invalid = '2023-03-99T12:00:00Z';
        const date2 = '2023-03-01T11:59:59Z';
        expect(dateUtils.isAfter(date1Invalid, date2)).toBe(false);
      });

      it('should return false when compared to invalid date', () => {
        const date1Invalid = '2023-03-99T12:00:00Z';
        const date2Invalid = '2023-99-01T11:59:59Z';
        expect(dateUtils.isAfter(date1Invalid, date2Invalid)).toBe(false);
      });

      it('should return false when compared to empty date string', () => {
        const date1Invalid = '2023-03-99T12:00:00Z';
        const date2Invalid = '';
        expect(dateUtils.isAfter(date1Invalid, date2Invalid)).toBe(false);
      });
    });
  });
});
