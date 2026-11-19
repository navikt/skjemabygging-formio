import { describe, expect, it } from 'vitest';
import { getCountryNameTranslations } from './countryNameTranslations';

describe('getCountryNameTranslations', () => {
  it('maps the Bokmål country name to Nynorsk and English', () => {
    const translations = getCountryNameTranslations();

    expect(translations.Belgia).toEqual({ nb: 'Belgia', nn: 'Belgia', en: 'Belgium' });
    expect(translations.Tyskland).toEqual({ nb: 'Tyskland', nn: 'Tyskland', en: 'Germany' });
  });
});
