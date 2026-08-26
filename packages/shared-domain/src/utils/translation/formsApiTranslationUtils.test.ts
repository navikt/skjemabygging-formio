import { formsApiTranslationUtils } from './formsApiTranslationUtils';

describe('FormsApiTranslation', () => {
  describe('translate', () => {
    const translations = {
      greeting: { nb: 'Hei, {{name}}!', nn: 'Hei, {{name}}!', en: 'Hello, {{name}}!' },
      name: { nb: 'Ola', nn: 'Ola', en: 'Oliver' },
      bokmaalOnly: { nb: 'Bokmål' },
    };

    it('translates using normalized locale codes', () => {
      expect(formsApiTranslationUtils.translate(translations, 'nn-NO', 'greeting', { name: 'name' })).toBe('Hei, Ola!');
      expect(formsApiTranslationUtils.translate(translations, 'en', 'greeting', { name: 'name' })).toBe(
        'Hello, Oliver!',
      );
    });

    it('falls back to bokmål and then the original key', () => {
      expect(formsApiTranslationUtils.translate(translations, 'en', 'bokmaalOnly')).toBe('Bokmål');
      expect(formsApiTranslationUtils.translate(translations, 'en', 'missing')).toBe('missing');
    });

    it('keeps unknown replacement placeholders', () => {
      expect(formsApiTranslationUtils.translate(translations, 'en', 'greeting', {})).toBe('Hello, {{name}}!');
    });
  });

  describe('findMostRecentlyChanged', () => {
    it('should return the most recently changed translation', () => {
      const translations = [
        { key: 'ja', changedAt: undefined },
        { key: 'fornavn', changedAt: '2025-02-14T08:27:45.123+01' },
        { key: 'etternavn', changedAt: '2025-02-14T08:25:12.165+01' },
      ];
      const result = formsApiTranslationUtils.findMostRecentlyChanged(translations);
      expect(result?.key).toBe('fornavn');
    });

    it('should take timezone into account and return the most recently changed translation', () => {
      const translations = [
        { key: 'ja', changedAt: undefined },
        { key: 'fornavn', changedAt: '2025-03-01T10:00:00.123+01' },
        { key: 'etternavn', changedAt: '2025-03-01T09:30:00.165Z' },
      ];
      const result = formsApiTranslationUtils.findMostRecentlyChanged(translations);
      expect(result?.key).toBe('etternavn');
    });

    it('should return undefined for empty array', () => {
      const result = formsApiTranslationUtils.findMostRecentlyChanged([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined input', () => {
      const result = formsApiTranslationUtils.findMostRecentlyChanged(undefined);
      expect(result).toBeUndefined();
    });
  });
});
