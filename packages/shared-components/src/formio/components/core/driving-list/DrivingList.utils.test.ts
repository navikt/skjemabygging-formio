import { DrivingListPeriod } from '@navikt/skjemadigitalisering-shared-domain';
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

  it('should return an array of weekly periods when periodType is weekly', () => {
    const result = generatePeriods('weekly', '2024-03-01', 3);
    const expectedPeriods: DrivingListPeriod[] = [
      { periodFrom: new Date('2024-03-01'), periodTo: new Date('2024-03-07'), id: expect.any(String) },
      { periodFrom: new Date('2024-03-08'), periodTo: new Date('2024-03-14'), id: expect.any(String) },
      { periodFrom: new Date('2024-03-15'), periodTo: new Date('2024-03-21'), id: expect.any(String) },
    ];
    expect(result).toEqual(expectedPeriods);
  });

  it('should return an array of monthly periods when periodType is monthly', () => {
    const result = generatePeriods('monthly', '2024-01-01', 3);
    const expectedPeriods: DrivingListPeriod[] = [
      { periodFrom: new Date('2024-01-01'), periodTo: new Date('2024-01-31'), id: expect.any(String) },
      { periodFrom: new Date('2024-02-01'), periodTo: new Date('2024-02-29'), id: expect.any(String) }, // Leap year
      { periodFrom: new Date('2024-03-01'), periodTo: new Date('2024-03-31'), id: expect.any(String) },
    ];
    expect(result).toEqual(expectedPeriods);
  });
});
