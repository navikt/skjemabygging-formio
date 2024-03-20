import { DrivingListPeriod } from '@navikt/skjemadigitalisering-shared-domain';
import { DateTime } from 'luxon';
import { generatePeriods } from './DrivingList.utils';

describe('generatePeriods function', () => {
  it('should return an empty array if no date is provided', () => {
    const result = generatePeriods('weekly');
    expect(result).toEqual([]);
  });

  it('should return an array with one period when numberOfPeriods is not provided', () => {
    const result = generatePeriods('weekly', '2024-03-01');
    expect(result.length).toBe(1);
  });

  it.only('should return an array of weekly periods when periodType is weekly', () => {
    const result = generatePeriods('weekly', '2023-03-01', 3);

    const expectedPeriods: DrivingListPeriod[] = [
      {
        periodFrom: DateTime.fromISO('2023-03-01').toJSDate(),
        periodTo: DateTime.fromISO('2023-03-07').toJSDate(),
        id: expect.any(String),
      },
      {
        periodFrom: DateTime.fromISO('2023-03-08').toJSDate(),
        periodTo: DateTime.fromISO('2023-03-14').toJSDate(),
        id: expect.any(String),
      },
      {
        periodFrom: DateTime.fromISO('2023-03-15').toJSDate(),
        periodTo: DateTime.fromISO('2023-03-21').toJSDate(),
        id: expect.any(String),
      },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should return an array of monthly periods when periodType is monthly', () => {
    const result = generatePeriods('monthly', '2023-12-01', 3);
    const expectedPeriods: DrivingListPeriod[] = [
      {
        periodFrom: DateTime.fromISO('2023-12-01').toJSDate(),
        periodTo: DateTime.fromISO('2023-12-31').toJSDate(),
        id: expect.any(String),
      },
      {
        periodFrom: DateTime.fromISO('2024-01-01').toJSDate(),
        periodTo: DateTime.fromISO('2024-01-31').toJSDate(),
        id: expect.any(String),
      }, // Leap year
      {
        periodFrom: DateTime.fromISO('2024-02-01').toJSDate(),
        periodTo: DateTime.fromISO('2024-02-29').toJSDate(),
        id: expect.any(String),
      },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should have todays date as the last periodTo', () => {
    const today = new Date();
    const tenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
    const formattedDate = tenDaysAgo.toISOString().split('T')[0];

    const result = generatePeriods('weekly', formattedDate, 2);

    expect(result[1].periodTo.getDate()).toEqual(today.getDate());
  });
});
