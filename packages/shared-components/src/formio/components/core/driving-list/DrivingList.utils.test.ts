import { DrivingListPeriod } from '@navikt/skjemadigitalisering-shared-domain';
import { DateTime } from 'luxon';
import { generatePeriods } from './DrivingList.utils';

describe('generatePeriods function', () => {
  it('should return an empty array if no date is provided', () => {
    const result = generatePeriods();
    expect(result).toEqual([]);
  });

  it('should return an array with one period when numberOfPeriods is not provided', () => {
    const result = generatePeriods('2024-03-01');
    expect(result.length).toBe(1);
  });

  it('should return an array of weekly periods', () => {
    const result = generatePeriods('2023-03-01', 3);

    const expectedPeriods: DrivingListPeriod[] = [
      {
        periodFrom: DateTime.fromISO('2023-03-01').toJSDate(), // Wednesday
        periodTo: DateTime.fromISO('2023-03-05').toJSDate(), // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: DateTime.fromISO('2023-03-06').toJSDate(), // Monday
        periodTo: DateTime.fromISO('2023-03-12').toJSDate(), // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: DateTime.fromISO('2023-03-13').toJSDate(), // Monday
        periodTo: DateTime.fromISO('2023-03-19').toJSDate(), // Sunday
        id: expect.any(String),
      },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should return an array with correct number of periods when number of periods is provided', () => {
    const numberOfPeriods = 5;
    const result = generatePeriods('2023-03-01', numberOfPeriods);
    expect(result.length).toEqual(numberOfPeriods);
  });

  it('should have todays date as the last periodTo', () => {
    const today = DateTime.now();
    const tenDaysAgo = today.minus({ days: 10 });

    const result = generatePeriods(tenDaysAgo.toISODate(), 3);

    const lastPeriodTo = DateTime.fromJSDate(result[result.length - 1].periodTo);

    expect(lastPeriodTo.toISODate()).toEqual(today.toISODate());
  });
});
