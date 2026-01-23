import moment from 'moment';
import { FormListType } from './FormsList';
import sortedForms from './formsListSortUtils';

const baseMoment = moment().toISOString();
const earlier = (base, days) => moment(base).subtract(days, 'day').toISOString();
const later = (base, days) => moment(base).add(days, 'day').toISOString();
const createFormMetadata = (_properties: Partial<FormListType>): FormListType =>
  ({
    id: 'id',
    modified: baseMoment,
    title: 'AAA',
    number: '000',
    status: 'UNKNOWN',
    ..._properties,
  }) as FormListType;

const abc = createFormMetadata({ title: 'abc' });
const ABC = createFormMetadata({ title: 'ABC' });
const number123 = createFormMetadata({ title: '123' });
const A1 = createFormMetadata({ title: 'A1' });
const AAsta = createFormMetadata({ title: 'Åsta' });
const aBC = createFormMetadata({ title: 'aBC' });
const emptyString = createFormMetadata({ title: '' });

const earliest = createFormMetadata({ title: 'Earliest', modified: earlier(baseMoment, '4') });
const early = createFormMetadata({ title: 'Early', modified: earlier(baseMoment, '2') });
const middle = createFormMetadata({ title: 'Middle', modified: baseMoment });
const late = createFormMetadata({ title: 'Late', modified: later(baseMoment, '2') });
const latest = createFormMetadata({ title: 'Latest', modified: later(baseMoment, '4') });
const noDate = createFormMetadata({ title: 'No modified', modified: undefined });

const nav01 = createFormMetadata({ number: 'NAV 01-00.00' });
const nav02 = createFormMetadata({ number: 'NAV 02-00.00' });
const nav03 = createFormMetadata({ number: 'NAV 03-00.00' });
const noneStandard01 = createFormMetadata({ number: 'ABC 02-00.00' });
const noneStandard02 = createFormMetadata({ number: 'NAV 02.00-00' });

const draft = createFormMetadata({ status: 'DRAFT' });
const published = createFormMetadata({ status: 'PUBLISHED' });
const unpublished = createFormMetadata({ status: 'UNPUBLISHED' });
const pending = createFormMetadata({ status: 'PENDING' });
const unknown = createFormMetadata({ status: 'UNKNOWN' });
const testform = createFormMetadata({ status: 'TESTFORM' });

describe('formsListUtils', () => {
  describe('sortFormsByProperty', () => {
    describe('title (string)', () => {
      const list = [aBC, ABC, AAsta, number123, emptyString, abc, A1];

      it('sorts in ascending order', () => {
        const sorted = sortedForms(list, {
          orderBy: 'title',
          direction: 'ascending',
        });
        expect(sorted).toHaveLength(7);
        expect(sorted).toStrictEqual([emptyString, number123, A1, ABC, aBC, abc, AAsta]);
      });

      it('sorts modified (date) in descending order', () => {
        const sorted = sortedForms(list, {
          orderBy: 'modified',
          direction: 'descending',
        });
        expect(sorted).toHaveLength(7);
        expect(sorted).toStrictEqual([AAsta, abc, aBC, ABC, A1, number123, emptyString]);
      });
    });

    describe('modified (date)', () => {
      const list = [early, noDate, latest, late, earliest, middle];

      it('sorts in ascending order', () => {
        const sorted = sortedForms(list, {
          orderBy: 'modified',
          direction: 'ascending',
        });
        expect(sorted).toHaveLength(6);
        expect(sorted).toStrictEqual([noDate, earliest, early, middle, late, latest]);
      });

      it('sorts modified (date) in descending order', () => {
        const sorted = sortedForms(list, {
          orderBy: 'modified',
          direction: 'descending',
        });
        expect(sorted).toHaveLength(6);
        expect(sorted).toStrictEqual([latest, late, middle, early, earliest, noDate]);
      });
    });
  });

  describe('sortByFormNumber', () => {
    const list = [nav02, noneStandard02, nav03, noneStandard01, nav01];

    it('places standard Nav form numbers first on ascending sort', () => {
      const sorted = sortedForms(list, {
        orderBy: 'number',
        direction: 'ascending',
      });
      expect(sorted).toHaveLength(5);
      expect(sorted).toStrictEqual([nav01, nav02, nav03, noneStandard01, noneStandard02]);
    });

    it('places standard Nav form numbers last on descending sort', () => {
      const sorted = sortedForms(list, {
        orderBy: 'number',
        direction: 'descending',
      });
      expect(sorted).toHaveLength(5);
      expect(sorted).toStrictEqual([noneStandard02, noneStandard01, nav03, nav02, nav01]);
    });
  });

  describe('sortByStatus', () => {
    const list = [draft, published, pending, testform, unpublished];
    const listWithUnknown = [pending, unknown, published, draft, unpublished, testform];

    it('sorts the list by status in fixed ascending order', () => {
      const sorted = sortedForms(list, {
        orderBy: 'status',
        direction: 'ascending',
      });
      expect(sorted).toStrictEqual([published, pending, draft, unpublished, testform]);
    });

    it('sorts the list by status in fixed descending order', () => {
      const sorted = sortedForms(list, {
        orderBy: 'status',
        direction: 'descending',
      });
      expect(sorted).toStrictEqual([testform, unpublished, draft, pending, published]);
    });

    it('adds items with status UNKNOWN to the end of list when sorting in ascending order', () => {
      const sorted = sortedForms(listWithUnknown, {
        orderBy: 'status',
        direction: 'ascending',
      });
      expect(sorted).toHaveLength(6);
      expect(sorted[5].status).toBe('UNKNOWN');
    });

    it('adds items with status UNKNOWN to the end of list when sorting in descending order', () => {
      const sorted = sortedForms(listWithUnknown, {
        orderBy: 'status',
        direction: 'descending',
      });
      expect(sorted).toHaveLength(6);
      expect(sorted[5].status).toBe('UNKNOWN');
    });
  });
});
