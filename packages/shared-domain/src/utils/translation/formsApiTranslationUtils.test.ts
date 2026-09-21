import { formsApiTranslationUtils } from './formsApiTranslationUtils';

describe('FormsApiTranslation', () => {
  describe('translate', () => {
    const translations = {
      greeting: { nb: 'Hei, {{name}}!', nn: 'Hei, {{name}}!', en: 'Hello, {{name}}!' },
      legacyTemplate: { nb: 'Dato: {{date}}', en: 'Date: {{- date}}' },
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

    it('supports legacy unescaped replacement placeholders', () => {
      expect(formsApiTranslationUtils.translate(translations, 'en', 'legacyTemplate', { date: '01.01.2025' })).toBe(
        'Date: 01.01.2025',
      );
    });
  });
});
