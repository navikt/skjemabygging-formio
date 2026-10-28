import { FormsApiTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import type { ContentSource } from '../content/contentSource';

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
  source?: ContentSource;
  timeoutMs?: number;
}
const getFormTranslations = async (props: GetFormTranslationsProps) => {
  const { baseUrl, formPath, languageCodes, source = 'latest', timeoutMs } = props;
  const resource = source === 'published' ? 'v1/form-publications' : formsUrl;
  const targetUrl = `${baseUrl}/${resource}/${encodeURIComponent(String(formPath))}/translations${buildLanguageCodesParam(languageCodes)}`;
  logger.debug('Getting form translations', { formPath, languageCodes, targetUrl });

  return await http.get<FormsApiTranslation[]>(targetUrl, {
    ...(timeoutMs !== undefined && { signal: AbortSignal.timeout(timeoutMs) }),
  });
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

  return await http.get<FormsApiTranslation[]>(targetUrl, {
    ...(timeoutMs !== undefined && { signal: AbortSignal.timeout(timeoutMs) }),
  });
};

interface GetPublishedGlobalTranslationsProps {
  baseUrl: string;
  languageCode: TranslationLang;
  timeoutMs: number;
}
const getPublishedGlobalTranslations = async ({
  baseUrl,
  languageCode,
  timeoutMs,
}: GetPublishedGlobalTranslationsProps) => {
  const targetUrl = `${baseUrl}/${publishedGlobalTranslationUrl}/${languageCode}`;
  logger.debug('Getting published global translations', { languageCode, targetUrl });

  return await http.get<Record<string, string>>(targetUrl, {
    signal: AbortSignal.timeout(timeoutMs),
  });
};

const translationClient = {
  getFormTranslations,
  getGlobalTranslations,
  getPublishedGlobalTranslations,
};

export default translationClient;
