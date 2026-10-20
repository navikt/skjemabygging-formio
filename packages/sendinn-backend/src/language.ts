import { localizationUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';

const supportedLanguages: TranslationLang[] = ['nb', 'nn', 'en'];

const isSupportedLanguage = (language: string): language is TranslationLang =>
  supportedLanguages.includes(language as TranslationLang);

/**
 * The language selected by the lang query parameter. Missing or unknown values fall back to nb,
 * the same way as in the frontend.
 */
const getSelectedLanguage = (searchParams: URLSearchParams): TranslationLang =>
  localizationUtils.getLanguageCodeAsIso639_1(searchParams.get('lang') ?? 'nb');

export { getSelectedLanguage, isSupportedLanguage, supportedLanguages };
