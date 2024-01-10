import moment from 'moment/moment';
import { validateEarliestAndLatestDate, validateToAndFromDate } from './validation';

Date.now = vi.fn(() => new Date('2030-05-15T12:00:00.000Z').getTime());

const translate = (text: string, params?: Record<string, any>) => {
  if (params)
    return text
      .replace(/{{2}([^{}]*minDate)}{2}/, params.minDate)
      .replace(/{{2}([^{}]*maxDate)}{2}/, params.maxDate)
      .replace(/{{2}([^{}]*fromDate)}{2}/, params.fromDate);
  else return text;
};
describe('validation', () => {
  describe('validateToAndFromDate', () => {
    let fromDate;
    let earlierThanFromDate;
    let sameAsFromDate;
    let laterThanFromDate;

    beforeEach(() => {
      fromDate = moment('2030-12-31');
      earlierThanFromDate = moment('2020-01-01');
      sameAsFromDate = moment('2030-12-31');
      laterThanFromDate = moment('2040-12-31');
    });

    describe('When mayBeEqual is true', () => {
      it('Fails with appropriate message when inputDate is earlier than from-date', () => {
        expect(validateToAndFromDate(fromDate, earlierThanFromDate, true, translate)).toBe(
          'Datoen kan ikke være tidligere enn 31.12.2030',
        );
      });

      it('Returns true when inputDate is same as from-date', () => {
        expect(validateToAndFromDate(fromDate, sameAsFromDate, true, translate)).toBe(true);
      });

      it('Returns true when inputDate is later than from-date', () => {
        expect(validateToAndFromDate(fromDate, laterThanFromDate, true, translate)).toBe(true);
      });
    });

    describe('When mayBeEqual is false', () => {
      it('fails with appropriate message when input is earlier than from-date', () => {
        expect(validateToAndFromDate(fromDate, earlierThanFromDate, false, translate)).toBe(
          'Datoen må være senere enn 31.12.2030',
        );
      });

      it('fails with appropriate message when input is same as from-date', () => {
        expect(validateToAndFromDate(fromDate, earlierThanFromDate, false, translate)).toBe(
          'Datoen må være senere enn 31.12.2030',
        );
      });

      it('Returns true when inputDate is later than from-date', () => {
        expect(validateToAndFromDate(fromDate, laterThanFromDate, false, translate)).toBe(true);
      });
    });
  });

  describe('validateEarliestAndLatestDate', () => {
    describe('When earliestFromToday and latestFromToday are set', () => {
      it("doesn't fail if latest is before earliest", () => {
        expect(validateEarliestAndLatestDate('2', '1', moment(), translate)).toBe(true);
      });

      it('fails with appropriate message if input is before earliest date', () => {
        expect(validateEarliestAndLatestDate('1', '2', moment(), translate)).toBe(
          'Datoen kan ikke være tidligere enn 16.05.2030 eller senere enn 17.05.2030',
        );
      });

      it('fails with appropriate message if input is after latest date', () => {
        expect(validateEarliestAndLatestDate('-2', '-1', moment(), translate)).toBe(
          'Datoen kan ikke være tidligere enn 13.05.2030 eller senere enn 14.05.2030',
        );
      });

      it('returns true if input is same as earliest date', () => {
        expect(validateEarliestAndLatestDate('0', '1', moment(), translate)).toBe(true);
      });

      it('returns true if input is between earliest and latest date', () => {
        expect(validateEarliestAndLatestDate('-1', '1', moment(), translate)).toBe(true);
      });

      it('returns true if input is same as latest date', () => {
        expect(validateEarliestAndLatestDate('-1', '0', moment(), translate)).toBe(true);
      });
    });

    describe('When earliestFromToday is set', () => {
      it('fails with appropriate message if input is before earliest date', () => {
        expect(validateEarliestAndLatestDate('1', '', moment(), translate)).toBe(
          'Datoen kan ikke være tidligere enn 16.05.2030',
        );
      });

      it('returns true if input is same as earliest date', () => {
        expect(validateEarliestAndLatestDate('0', '', moment(), translate)).toBe(true);
      });

      it('returns true if input is after earliest', () => {
        expect(validateEarliestAndLatestDate('-1', '', moment(), translate)).toBe(true);
      });
    });

    describe('When latestFromToday is set', () => {
      it('fails with appropriate message if input is after latest date', () => {
        expect(validateEarliestAndLatestDate('', '-1', moment(), translate)).toBe(
          'Datoen kan ikke være senere enn 14.05.2030',
        );
      });

      it('returns true if input is same as latest date', () => {
        expect(validateEarliestAndLatestDate('', '0', moment(), translate)).toBe(true);
      });

      it('returns true if input is before latest', () => {
        expect(validateEarliestAndLatestDate('', '1', moment(), translate)).toBe(true);
      });
    });

    describe('both earliestFromToday and latestFromToday is set to number 0', () => {
      it('fails if selected date is tomorrow', () => {
        expect(validateEarliestAndLatestDate(0, 0, moment().add(1, 'd'), translate)).toBe(
          'Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030',
        );
      });

      it('validates ok if selected date is today', () => {
        expect(validateEarliestAndLatestDate(0, 0, moment(), translate)).toBe(true);
      });

      it('validates ok if selected date is yesterday', () => {
        expect(validateEarliestAndLatestDate(0, 0, moment().subtract(1, 'd'), translate)).toBe(
          'Datoen kan ikke være tidligere enn 15.05.2030 eller senere enn 15.05.2030',
        );
      });
    });

    describe('latestFromToday is set to number 0', () => {
      it('fails if selected date is tomorrow', () => {
        expect(validateEarliestAndLatestDate(undefined, 0, moment().add(1, 'd'), translate)).toBe(
          'Datoen kan ikke være senere enn 15.05.2030',
        );
      });

      it('validates ok if selected date is today', () => {
        expect(validateEarliestAndLatestDate(undefined, 0, moment(), translate)).toBe(true);
      });

      it('validates ok if selected date is yesterday', () => {
        expect(validateEarliestAndLatestDate(undefined, 0, moment().subtract(1, 'd'), translate)).toBe(true);
      });
    });

    describe('earliestFromToday is set to number 0', () => {
      it('fails if selected date is yesterday', () => {
        expect(validateEarliestAndLatestDate(0, undefined, moment().subtract(1, 'd'), translate)).toBe(
          'Datoen kan ikke være tidligere enn 15.05.2030',
        );
      });

      it('validates ok if selected date is today', () => {
        expect(validateEarliestAndLatestDate(0, undefined, moment(), translate)).toBe(true);
      });

      it('validates ok if selected date is tomorrow', () => {
        expect(validateEarliestAndLatestDate(0, undefined, moment().add(1, 'd'), translate)).toBe(true);
      });
    });

    it('returns true if neither earliestFromToday or latestFromToday are set', () => {
      expect(validateEarliestAndLatestDate('', '', moment(), translate)).toBe(true);
    });

    it('returns true if both earliestFromToday or latestFromToday are undefined', () => {
      expect(validateEarliestAndLatestDate(undefined, undefined, moment(), translate)).toBe(true);
    });
  });
});
