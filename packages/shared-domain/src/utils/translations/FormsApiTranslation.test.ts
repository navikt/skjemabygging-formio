import { formsApiTranslations } from './FormsApiTranslation';

describe('FormsApiTranslation', () => {
  describe('findMostRecentlyChanged', () => {
    it('should return the most recently changed translation', () => {
      const translations = [
        { key: 'ja', changedAt: undefined },
        { key: 'fornavn', changedAt: '2025-02-14T08:27:45.123+01' },
        { key: 'etternavn', changedAt: '2025-02-14T08:25:12.165+01' },
      ];
      const result = formsApiTranslations.findMostRecentlyChanged(translations);
      expect(result?.key).toBe('fornavn');
    });

    it('should take timezone into account and return the most recently changed translation', () => {
      const translations = [
        { key: 'ja', changedAt: undefined },
        { key: 'fornavn', changedAt: '2025-03-01T10:00:00.123+01' },
        { key: 'etternavn', changedAt: '2025-03-01T09:30:00.165Z' },
      ];
      const result = formsApiTranslations.findMostRecentlyChanged(translations);
      expect(result?.key).toBe('etternavn');
    });

    it('should return undefined for empty array', () => {
      const result = formsApiTranslations.findMostRecentlyChanged([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = formsApiTranslations.findMostRecentlyChanged(undefined);
      expect(result).toBeUndefined();
    });
  });
});
