import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { addValidationDefaults } from './translationMapper';

describe('translationMapper', () => {
  describe('addValidationDefaults', () => {
    it('adds the Bokmål text to a validation translation stored without one', () => {
      const translations = addValidationDefaults({
        required: { nn: 'Du må fylle ut: {{field}}', en: 'You must fill in: {{field}}' },
      });

      expect(translations.required).toEqual({
        nb: TEXTS.validering.required,
        nn: 'Du må fylle ut: {{field}}',
        en: 'You must fill in: {{field}}',
      });
    });

    it('adds the Bokmål text for a validation key that is not stored', () => {
      expect(addValidationDefaults({}).maxYear).toEqual({ nb: TEXTS.validering.maxYear });
    });

    it('keeps a stored Bokmål text and leaves other translations unchanged', () => {
      const translations = addValidationDefaults({
        fileMissing: { nb: 'Last opp: {{field}}' },
        Ja: { en: 'Yes' },
      });

      expect(translations.fileMissing).toEqual({ nb: 'Last opp: {{field}}' });
      expect(translations.Ja).toEqual({ en: 'Yes' });
      expect(translations[TEXTS.validering.required]).toBeUndefined();
    });
  });
});
