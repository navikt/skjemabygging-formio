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

  describe('createTranslate', () => {
    it.each(['nn-NO', 'en'])('falls back to bokmaal when the %s translation is empty', (language) => {
      const translate = formsApiTranslationUtils.createTranslate({ answer: { nb: 'Ja', nn: '', en: '' } }, language);

      expect(translate('answer')).toBe('Ja');
    });

    it.each(['nb', 'en'])(
      'falls back to the original key when the %s and bokmaal translations are empty',
      (language) => {
        const translate = formsApiTranslationUtils.createTranslate({ documentTitle: { nb: '', en: '' } }, language);

        expect(translate('documentTitle')).toBe('documentTitle');
      },
    );

    it('interpolates fallback text and falls back for translated replacement values', () => {
      const translate = formsApiTranslationUtils.createTranslate(
        { summary: { nb: 'Answer: {{answer}}', en: '' }, answer: { nb: 'Ja', en: '' } },
        'en',
      );

      expect(translate('summary', { answer: 'answer' })).toBe('Answer: Ja');
    });
  });
});
