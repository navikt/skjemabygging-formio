import { DrivingListPeriod, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

describe('generateWeeklyPeriods function', () => {
  it('should return an empty array if no date is provided', () => {
    const result = dateUtils.generateWeeklyPeriods();
    expect(result).toEqual([]);
  });

  it('should return an array with one period when numberOfPeriods is not provided', () => {
    const result = dateUtils.generateWeeklyPeriods('2024-03-01');
    expect(result.length).toBe(1);
  });

  it('should return an array of weekly periods', () => {
    const result = dateUtils.generateWeeklyPeriods('2023-03-01', 3);

    const expectedPeriods: DrivingListPeriod[] = [
      {
        periodFrom: new Date('2023-02-28T23:00:00.000Z'), // Wednesday
        periodTo: new Date('2023-03-04T23:00:00.000Z'), // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: new Date('2023-03-05T23:00:00.000Z'), // Monday
        periodTo: new Date('2023-03-11T23:00:00.000Z'), // Sunday
        id: expect.any(String),
      },
      {
        periodFrom: new Date('2023-03-12T23:00:00.000Z'), // Monday
        periodTo: new Date('2023-03-18T23:00:00.000Z'), // Sunday
        id: expect.any(String),
      },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should return an array with correct number of periods when number of periods is provided', () => {
    const numberOfPeriods = 5;
    const result = dateUtils.generateWeeklyPeriods('2023-03-01', numberOfPeriods);
    expect(result.length).toEqual(numberOfPeriods);
  });

  it('should have todays date as the last periodTo', () => {
    const today = new Date();

    const tenDaysAgo = new Date(today);
    tenDaysAgo.setDate(today.getDate() - 10);

    const result = dateUtils.generateWeeklyPeriods(tenDaysAgo.toISOString(), 3);

    const lastPeriodTo = new Date(result[result.length - 1].periodTo);

    expect(lastPeriodTo.toISOString()).toEqual(today.toISOString());
  });
});
