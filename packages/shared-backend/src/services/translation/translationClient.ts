import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const globalTranslationUrl = 'v1/global-translations';
const publishedGlobalTranslationUrl = 'v1/published-global-translations';

const buildLanguageCodesParam = (languageCodes?: TranslationLang[]): string => {
  return languageCodes ? `?${new URLSearchParams({ languageCodes: languageCodes.toString() })}` : '';
};

interface GetFormTranslationsProps {
  baseUrl: string;
  formPath?: string;
  languageCodes?: TranslationLang[];
}
const getFormTranslations = async (props: GetFormTranslationsProps) => {
  const { baseUrl, formPath, languageCodes } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${formPath}/translations${buildLanguageCodesParam(languageCodes)}`;
  logger.info('Getting form translations', { formPath, languageCodes, targetUrl });

  return await http.get<FormsApiTranslation[]>(targetUrl);
};

interface GetGlobalTranslationsProps {
  baseUrl: string;
  languageCodes?: TranslationLang[];
}
const getGlobalTranslations = async (props: GetGlobalTranslationsProps) => {
  const { baseUrl, languageCodes } = props;
  const targetUrl = `${baseUrl}/${globalTranslationUrl}${buildLanguageCodesParam(languageCodes)}`;
  logger.info('Getting global translations', { languageCodes, targetUrl });

  return await http.get<FormsApiTranslation[]>(targetUrl);
};

interface GetPublishedGlobalTranslationsProps {
  baseUrl: string;
  languageCode: TranslationLang;
}
const getPublishedGlobalTranslations = async ({ baseUrl, languageCode }: GetPublishedGlobalTranslationsProps) => {
  const targetUrl = `${baseUrl}/${publishedGlobalTranslationUrl}/${languageCode}`;
  logger.info('Getting published global translations', { languageCode, targetUrl });

  return await http.get<Record<string, string>>(targetUrl);
};

const translationClient = {
  getFormTranslations,
  getGlobalTranslations,
  getPublishedGlobalTranslations,
};

export default translationClient;
