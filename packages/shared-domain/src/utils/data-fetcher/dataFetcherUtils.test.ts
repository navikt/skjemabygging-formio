import { Submission } from '../../models';
import { dataFetcherUtils } from './dataFetcherUtils';

const activities = [
  { value: 'kurs', label: 'Kurs' },
  { value: 'annet', label: 'Annet' },
];

const createSubmission = (answer?: Record<string, boolean>): Submission => ({
  data: { aktiviteter: answer === undefined ? {} : { aktivitet: answer } },
  metadata: { dataFetcher: { aktiviteter: { aktivitet: { data: activities } } } } as Submission['metadata'],
});

describe('dataFetcherUtils', () => {
  describe('dataFetcher', () => {
    it('finds no selected items before the user has answered', () => {
      const fetcher = dataFetcherUtils.dataFetcher('aktiviteter.aktivitet', createSubmission());

      expect(fetcher.selected('COUNT')).toBe(0);
      expect(fetcher.selected('OTHER')).toBe(false);
      expect(fetcher.selected({ value: 'kurs' })).toBe(false);
      expect(fetcher.getAllSelected()).toEqual([]);
    });

    it('finds the selected items', () => {
      const fetcher = dataFetcherUtils.dataFetcher(
        'aktiviteter.aktivitet',
        createSubmission({ kurs: true, annet: true }),
      );

      expect(fetcher.selected('COUNT')).toBe(1);
      expect(fetcher.selected('OTHER')).toBe(true);
      expect(fetcher.getAllSelected()).toEqual(activities);
    });
  });
});
