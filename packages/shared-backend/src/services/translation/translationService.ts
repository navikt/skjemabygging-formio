import {
  FormsApiTranslationMap,
  I18nTranslations,
  ResponseError,
  TranslationLang,
  languageUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { fileUtil, translationUtil } from '../../util';
import translationClient from './translationClient';
import {
  convertI18nTranslationsToFormsApiTranslationMap,
  convertToFormsApiTranslationMap,
  getGlobalTranslationFilename,
} from './translationMapper';

type TranslationClient = Pick<typeof translationClient, 'getFormTranslations' | 'getGlobalTranslations'>;

interface GetFormTranslationsProps {
  formPath: string;
  languageCodes?: TranslationLang[];
}

interface GetTranslationsProps {
  formPath: string;
  languageCodes?: TranslationLang[];
}

interface CreateTranslationsProps {
  formPath: string;
  languageCode: TranslationLang;
}

type TranslationService = {
  getTranslations: (props: GetTranslationsProps) => Promise<FormsApiTranslationMap>;
  createTranslate: (props: CreateTranslationsProps) => Promise<ReturnType<typeof translationUtil.createTranslate>>;
};

interface CreateTranslationServiceConfig {
  formsApiStaging?: boolean;
  mocksEnabled?: boolean;
  translationsLocation?: string;
  globalTranslationsLocation?: string;
}

interface CreateTranslationServiceProps extends CreateTranslationServiceConfig {
  baseUrl: string;
  client?: TranslationClient;
}

const createTranslationService = ({
  baseUrl,
  formsApiStaging,
  mocksEnabled,
  translationsLocation,
  globalTranslationsLocation,
  client = translationClient,
}: CreateTranslationServiceProps): TranslationService => {
  const getFormTranslations = async (props: GetFormTranslationsProps) => {
    const { formPath, languageCodes } = props;

    if (formsApiStaging || mocksEnabled) {
      const translations = await client.getFormTranslations({
        baseUrl,
        formPath,
        languageCodes,
      });

      if (!translations) {
        return {};
      }

      return convertToFormsApiTranslationMap(translations);
    }

    const translations: I18nTranslations | undefined = await fileUtil.loadJsonFileFromDirectory(
      translationsLocation,
      formPath,
    );
    if (!translations) {
      return {};
    }
    return convertI18nTranslationsToFormsApiTranslationMap(translations);
  };

  const getGlobalTranslations = async (languageCodes?: TranslationLang[]) => {
    if (formsApiStaging || mocksEnabled) {
      const translations = await client.getGlobalTranslations({
        baseUrl,
        languageCodes,
      });

      if (!translations) {
        return {};
      }

      return convertToFormsApiTranslationMap(translations);
    }

    const langsToLoad: TranslationLang[] = languageCodes ?? ['nb', 'nn', 'en'];

    const globalTranslationFiles = await Promise.all(
      langsToLoad.map(async (lang) => {
        const fileContent = await fileUtil.loadJsonFileFromDirectory(
          globalTranslationsLocation,
          getGlobalTranslationFilename(lang),
        );
        if (!fileContent) {
          return {};
        }
        return languageUtils.flattenGlobalI18nGroupedByTag(fileContent);
      }),
    );
    const mergedI18n: I18nTranslations = globalTranslationFiles.reduce(
      (acc, translations) => ({ ...acc, ...translations }),
      {},
    );
    return convertI18nTranslationsToFormsApiTranslationMap(mergedI18n);
  };

  const getTranslations = async (props: GetTranslationsProps) => {
    const { formPath, languageCodes } = props;

    if (!formPath) {
      throw new ResponseError('BAD_REQUEST', 'Form path is required when getting translations');
    }

    const translations = await Promise.all([
      getGlobalTranslations(languageCodes),
      getFormTranslations({
        formPath,
        languageCodes,
      }),
    ]);

    return { ...translations[0], ...translations[1] };
  };

  const createTranslate = async (props: CreateTranslationsProps) => {
    const { formPath, languageCode } = props;
    const translations = await getTranslations({
      formPath,
      languageCodes: [languageCode],
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
