import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import translationClient from './translationClient';

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const RETRY_DELAY_MS = 30 * 1000;
const FETCH_TIMEOUT_MS = 5 * 1000;

type PublishedTranslationClient = Pick<typeof translationClient, 'getPublishedGlobalTranslations'>;

interface CacheEntry {
  translations: FormsApiTranslationMap;
  expiresAt: number;
}

interface CreatePublishedTranslationServiceProps {
  baseUrl: string;
  ttlMs?: number;
  client?: PublishedTranslationClient;
  now?: () => number;
}

type PublishedTranslationService = {
  /**
   * Published global translations for one language, cached per language.
   * Never throws: on failure it serves stale content, or an empty map so the UI falls back to nb.
   * Fetches time out after 5 seconds; failed refreshes keep stale content for 30 seconds before retrying.
   */
  getGlobalTranslations: (languageCode: TranslationLang) => Promise<FormsApiTranslationMap>;
};

const toTranslationMap = (
  languageCode: TranslationLang,
  translations: Record<string, string> | undefined,
): FormsApiTranslationMap =>
  Object.fromEntries(Object.entries(translations ?? {}).map(([key, value]) => [key, { [languageCode]: value }]));

const createPublishedTranslationService = ({
  baseUrl,
  ttlMs = DEFAULT_TTL_MS,
  client = translationClient,
  now = Date.now,
}: CreatePublishedTranslationServiceProps): PublishedTranslationService => {
  const cache = new Map<TranslationLang, CacheEntry>();
  const pending = new Map<TranslationLang, Promise<FormsApiTranslationMap>>();

  const refresh = async (languageCode: TranslationLang): Promise<FormsApiTranslationMap> => {
    try {
      const response = await client.getPublishedGlobalTranslations({
        baseUrl,
        languageCode,
        timeoutMs: FETCH_TIMEOUT_MS,
      });
      const translations = toTranslationMap(languageCode, response);
      cache.set(languageCode, { translations, expiresAt: now() + ttlMs });
      return translations;
    } catch (error) {
      const stale = cache.get(languageCode);
      if (stale) {
        cache.set(languageCode, { ...stale, expiresAt: now() + RETRY_DELAY_MS });
      }
      logger.warn('Failed to fetch published global translations', {
        languageCode,
        servingStale: !!stale,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return stale?.translations ?? {};
    }
  };

  const getGlobalTranslations = (languageCode: TranslationLang): Promise<FormsApiTranslationMap> => {
    const cached = cache.get(languageCode);
    if (cached && cached.expiresAt > now()) {
      return Promise.resolve(cached.translations);
    }

    const inFlight = pending.get(languageCode);
    if (inFlight) {
      return inFlight;
    }

    const request = refresh(languageCode).finally(() => pending.delete(languageCode));
    pending.set(languageCode, request);
    return request;
  };

  return { getGlobalTranslations };
};

export { createPublishedTranslationService };
export type { PublishedTranslationService };
