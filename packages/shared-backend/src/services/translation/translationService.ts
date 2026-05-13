import {
  FormsApiTranslation,
  FormsApiTranslationMap,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { translationUtil } from '../../util';
import translationClient from './translationClient';

type TranslationClient = Pick<typeof translationClient, 'getFormTranslations' | 'getGlobalTranslations'>;

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
  client?: TranslationClient;
}

const createTranslationService = ({
  baseUrl,
  client = translationClient,
}: CreateTranslationServiceProps): TranslationService => {
  const getFormTranslations = async (props: GetFormTranslationsProps) => {
    const { formPath } = props;

    const translations = await client.getFormTranslations({
      baseUrl,
      formPath,
    });

    if (!translations) {
      return {};
    }

    return convertToFormsApiTranslationMap(translations);
  };

  const getGlobalTranslations = async () => {
    const translations = await client.getGlobalTranslations({
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
