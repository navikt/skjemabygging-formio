import { TranslationLang } from '../../models';
import { localizationUtils } from '../translation/localizationUtils';

const languages: TranslationLang[] = ['nb', 'nn', 'en'];

const isSupportedLanguage = (language: string): language is TranslationLang =>
  languages.includes(language as TranslationLang);

/**
 * The language selected by the lang query parameter. Missing or unknown values fall back to nb.
 */
const getSelectedLanguage = (searchParams: URLSearchParams): TranslationLang =>
  localizationUtils.getLanguageCodeAsIso639_1(searchParams.get('lang') ?? 'nb');

const sendinnLanguageUtils = {
  languages,
  isSupportedLanguage,
  getSelectedLanguage,
};

export { sendinnLanguageUtils };
