import {
  FormsApiTranslation,
  PublishedTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';
const formPublicationsUrl = 'v1/form-publications';
const globalTranslationUrl = 'v1/global-translations';
const publishedGlobalTranslationUrl = 'v1/published-global-translations';

const buildLanguageCodesParam = (languageCodes?: TranslationLang[]): string => {
  return languageCodes ? `?${new URLSearchParams({ languageCodes: languageCodes.toString() })}` : '';
};

interface GetFormTranslationsProps {
  baseUrl: string;
  formPath?: string;
  languageCodes?: TranslationLang[];
  timeoutMs?: number;
}
const getFormTranslations = async (props: GetFormTranslationsProps) => {
  const { baseUrl, formPath, languageCodes, timeoutMs } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${encodeURIComponent(String(formPath))}/translations${buildLanguageCodesParam(languageCodes)}`;
  logger.debug('Getting form translations', { formPath, languageCodes, targetUrl });

  return await http.get<FormsApiTranslation[]>(targetUrl, { timeoutMs });
};

interface GetPublishedFormTranslationsProps {
  baseUrl: string;
  formPath: string;
  languageCodes: TranslationLang[];
  timeoutMs?: number;
}
const getPublishedFormTranslations = async (props: GetPublishedFormTranslationsProps) => {
  const { baseUrl, formPath, languageCodes, timeoutMs } = props;
  const targetUrl = `${baseUrl}/${formPublicationsUrl}/${encodeURIComponent(formPath)}/translations${buildLanguageCodesParam(languageCodes)}`;
  logger.debug('Getting published form translations', { formPath, languageCodes, targetUrl });

  return await http.get<PublishedTranslations>(targetUrl, { timeoutMs });
};

interface GetGlobalTranslationsProps {
  baseUrl: string;
  languageCodes?: TranslationLang[];
  timeoutMs?: number;
}
const getGlobalTranslations = async (props: GetGlobalTranslationsProps) => {
  const { baseUrl, languageCodes, timeoutMs } = props;
  const targetUrl = `${baseUrl}/${globalTranslationUrl}${buildLanguageCodesParam(languageCodes)}`;
  logger.debug('Getting global translations', { languageCodes, targetUrl });

  return await http.get<FormsApiTranslation[]>(targetUrl, { timeoutMs });
};

interface GetPublishedGlobalTranslationsProps {
  baseUrl: string;
  languageCode: TranslationLang;
  timeoutMs?: number;
}
const getPublishedGlobalTranslations = async ({
  baseUrl,
  languageCode,
  timeoutMs,
}: GetPublishedGlobalTranslationsProps) => {
  const targetUrl = `${baseUrl}/${publishedGlobalTranslationUrl}/${languageCode}`;
  logger.debug('Getting published global translations', { languageCode, targetUrl });

  return await http.get<Record<string, string>>(targetUrl, { timeoutMs });
};

const translationClient = {
  getFormTranslations,
  getGlobalTranslations,
  getPublishedFormTranslations,
  getPublishedGlobalTranslations,
};

export default translationClient;
