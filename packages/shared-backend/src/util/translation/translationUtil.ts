import {
  FormsApiTranslationMap,
  I18nTranslationReplacements,
  localizationUtils,
  ResponseError,
  Tkey,
  TranslateFunction,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';

interface TranslateProps {
  textOrKey: string | Tkey;
  params?: I18nTranslationReplacements;
  translations?: FormsApiTranslationMap;
  currentLanguage?: TranslationLang;
}
const translateWithTextReplacements = ({
  textOrKey,
  params,
  translations = {},
  currentLanguage = 'nb',
}: TranslateProps): string => {
  const translation = translations[textOrKey];

  return injectParams({
    textOrKey: translation?.[currentLanguage] ? translation[currentLanguage] : textOrKey,
    params,
    translations,
    currentLanguage,
  });
};

const injectParams = ({ textOrKey, params, translations, currentLanguage }: TranslateProps) => {
  if (textOrKey && params) {
    return textOrKey.replace(
      /{{2}([^{}]+)}{2}/g,
      (match, $1) => translateWithTextReplacements({ textOrKey: params[$1], translations, currentLanguage }) || match,
    );
  }

  return textOrKey;
};

const createTranslate = (translations: FormsApiTranslationMap, languageCode: TranslationLang): TranslateFunction => {
  if (!languageCode || !translations || Object.keys(translations).length === 0) {
    throw new ResponseError('BAD_REQUEST', 'Missing required parameters for creating translate function');
  }

  return (text: string | Tkey, textReplacements?: I18nTranslationReplacements) =>
    translateWithTextReplacements({
      translations,
      textOrKey: text,
      params: textReplacements,
      currentLanguage: localizationUtils.getLanguageCodeAsIso639_1(languageCode.toLowerCase()),
    });
};

const translationUtil = {
  translateWithTextReplacements,
  createTranslate,
};

export default translationUtil;
