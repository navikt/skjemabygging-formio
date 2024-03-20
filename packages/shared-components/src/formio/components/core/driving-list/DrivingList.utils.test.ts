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

  it('should have todays date as the last periodTo', () => {
    const today = DateTime.now();
    const tenDaysAgo = today.minus({ days: 10 }).toISODate();

    const result = generatePeriods(tenDaysAgo, 2);

    const lastPeriodTo = DateTime.fromJSDate(result[1].periodTo);

    expect(lastPeriodTo.toISODate()).toEqual(today.toISODate());
  });
});
