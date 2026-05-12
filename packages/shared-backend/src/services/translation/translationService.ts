import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { translationUtil } from '../../util';
import translationApiService from './translationApiService';

type TranslationApiService = Pick<typeof translationApiService, 'getFormTranslations' | 'getGlobalTranslations'>;

const convertToFormsApiTranslationMap = (translations: FormsApiTranslation[]): FormsApiTranslationMap => {
  return translations.reduce((accumulator, currentItem: FormsApiTranslation) => {
    accumulator[currentItem.key] = {
      nb: currentItem.nb,
      nn: currentItem.nn,
      en: currentItem.en,
    };
    return accumulator;
  }, {} as FormsApiTranslationMap);
};

interface GetFormTranslationsProps {
  formPath: string;
}

interface GetTranslationsProps {
  formPath: string;
}

interface CreateTranslationsProps {
  formPath: string;
  languageCode: TranslationLang;
}

type TranslationService = {
  getTranslations: (props: GetTranslationsProps) => Promise<FormsApiTranslationMap>;
  createTranslate: (props: CreateTranslationsProps) => Promise<ReturnType<typeof translationUtil.createTranslate>>;
};

interface CreateTranslationServiceProps {
  baseUrl: string;
  apiService?: TranslationApiService;
}

const createTranslationService = ({
  baseUrl,
  apiService = translationApiService,
}: CreateTranslationServiceProps): TranslationService => {
  const getFormTranslations = async (props: GetFormTranslationsProps) => {
    const { formPath } = props;

    const translations = await apiService.getFormTranslations({
      baseUrl,
      formPath,
    });

    if (!translations) {
      return {};
    }

    return convertToFormsApiTranslationMap(translations);
  };

  const getGlobalTranslations = async () => {
    const translations = await apiService.getGlobalTranslations({
      baseUrl,
    });

    if (!translations) {
      return {};
    }

    return convertToFormsApiTranslationMap(translations);
  };

  const getTranslations = async (props: GetTranslationsProps) => {
    const { formPath } = props;

    const translations = await Promise.all([
      getGlobalTranslations(),
      getFormTranslations({
        formPath,
      }),
    ]);

    return { ...translations[0], ...translations[1] };
  };

  const createTranslate = async (props: CreateTranslationsProps) => {
    const { formPath, languageCode } = props;
    const translations = await getTranslations({
      formPath,
    });

    return translationUtil.createTranslate(translations, languageCode);
  };

  return {
    getTranslations,
    createTranslate,
  };
};

export { createTranslationService };
export type { TranslationService };
