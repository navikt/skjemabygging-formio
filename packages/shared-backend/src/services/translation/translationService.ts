import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import translationUtil from '../../util/translation/translationUtil';
import translationApiService from './translationApiService';

const convertToFormsApiTranslationMap = (translations: FormsApiTranslation[]) => {
  return translations.reduce((accumulator, currentItem: FormsApiTranslation) => {
    accumulator[currentItem.key] = {
      nb: currentItem.nb,
      nn: currentItem.nn,
      en: currentItem.en,
    };
    return accumulator;
  }, {});
};

interface GetFormTranslationsType {
  baseUrl: string;
  formPath: string;
}
const getFormTranslations = async (props: GetFormTranslationsType) => {
  const { baseUrl, formPath } = props;

  const translations = await translationApiService.getFormTranslations({
    baseUrl,
    formPath,
  });

  if (!translations) {
    return {};
  }

  return convertToFormsApiTranslationMap(translations);
};

interface GetGlobalTranslationsType {
  baseUrl: string;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsType) => {
  const { baseUrl } = props;

  const translations = await translationApiService.getGlobalTranslations({
    baseUrl,
  });

  if (!translations) {
    return {};
  }

  return convertToFormsApiTranslationMap(translations);
};

interface GetTranslationsType {
  baseUrl: string;
  formPath: string;
}
const getTranslations = async (props: GetTranslationsType) => {
  const { baseUrl, formPath } = props;

  const translations = await Promise.all([
    getGlobalTranslations({
      baseUrl,
    }),
    getFormTranslations({
      baseUrl,
      formPath,
    }),
  ]);

  return { ...translations[0], ...translations[1] };
};

interface CreateTranslationsType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const createTranslate = async (props: CreateTranslationsType) => {
  const { baseUrl, formPath, languageCode } = props;
  const translations = await getTranslations({
    baseUrl,
    formPath,
  });

  return translationUtil.createTranslate(translations, languageCode);
};

const translationService = {
  getTranslations,
  createTranslate,
};

export default translationService;
