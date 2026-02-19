import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { translationUtil } from '../../util';
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

interface GetFormTranslationsProps {
  baseUrl: string;
  formPath: string;
}
const getFormTranslations = async (props: GetFormTranslationsProps) => {
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

interface GetGlobalTranslationsProps {
  baseUrl: string;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsProps) => {
  const { baseUrl } = props;

  const translations = await translationApiService.getGlobalTranslations({
    baseUrl,
  });

  if (!translations) {
    return {};
  }

  return convertToFormsApiTranslationMap(translations);
};

interface GetTranslationsProps {
  baseUrl: string;
  formPath: string;
}
const getTranslations = async (props: GetTranslationsProps) => {
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

interface CreateTranslationsProps {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const createTranslate = async (props: CreateTranslationsProps) => {
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
