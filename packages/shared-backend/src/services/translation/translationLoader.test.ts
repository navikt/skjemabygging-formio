import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import type translationClient from './translationClient';
import { loadFormTranslations, loadGlobalTranslations } from './translationLoader';

const baseUrl = 'http://forms-api.test';
const formPath = 'nav123456';

const createClient = (overrides: Record<string, unknown>) =>
  ({
    getFormTranslations: vi.fn(),
    getGlobalTranslations: vi.fn(),
    getPublishedFormTranslations: vi.fn(),
    getPublishedGlobalTranslations: vi.fn(),
    ...overrides,
  }) as unknown as typeof translationClient;

describe('translationLoader', () => {
  it('combines published form translations per key across languages', async () => {
    const client = createClient({
      getPublishedFormTranslations: vi.fn().mockResolvedValue({
        publishedAt: '2026-01-01',
        publishedBy: 'Publisher',
        translations: {
          nn: { Attachment: 'Vedlegg nn', required: 'Du må fylle ut: {{field}} nn' },
          en: { Attachment: 'Attachment en', required: 'You must fill in: {{field}}' },
        },
      }),
    });

    const translations = await loadFormTranslations({
      baseUrl,
      formPath,
      source: 'published',
      languageCodes: ['nn', 'en'],
      client,
    });

    expect(client.getPublishedFormTranslations).toHaveBeenCalledWith({
      baseUrl,
      formPath,
      languageCodes: ['nn', 'en'],
      timeoutMs: undefined,
    });
    expect(translations).toEqual({
      Attachment: { nb: undefined, nn: 'Vedlegg nn', en: 'Attachment en' },
      required: {
        nb: TEXTS.validering.required,
        nn: 'Du må fylle ut: {{field}} nn',
        en: 'You must fill in: {{field}}',
      },
      [TEXTS.validering.required]: {
        nb: TEXTS.validering.required,
        nn: 'Du må fylle ut: {{field}} nn',
        en: 'You must fill in: {{field}}',
      },
    });
  });

  it('fetches published global translations once per language and keeps published nb over the fallback', async () => {
    const dictionaries: Record<string, Record<string, string>> = {
      nb: { required: 'Published nb' },
      en: { required: 'Published en', Yes: 'Yes' },
    };
    const client = createClient({
      getPublishedGlobalTranslations: vi.fn(async ({ languageCode }) => dictionaries[languageCode]),
    });

    const translations = await loadGlobalTranslations({
      baseUrl,
      source: 'published',
      languageCodes: ['nb', 'en'],
      client,
    });

    expect(client.getPublishedGlobalTranslations).toHaveBeenCalledTimes(2);
    expect(translations).toMatchObject({
      required: { nb: 'Published nb', en: 'Published en' },
      Yes: { en: 'Yes' },
    });
  });

  it.each([
    {
      name: 'form',
      load: (client: typeof translationClient) =>
        loadFormTranslations({ baseUrl, formPath, source: 'published', languageCodes: ['en'], client }),
    },
    {
      name: 'global',
      load: (client: typeof translationClient) =>
        loadGlobalTranslations({ baseUrl, source: 'published', languageCodes: ['nb', 'en'], client }),
    },
  ])('returns undefined when a published $name response is missing', async ({ load }) => {
    const client = createClient({
      getPublishedFormTranslations: vi.fn().mockResolvedValue(null),
      getPublishedGlobalTranslations: vi.fn(async ({ languageCode }) => (languageCode === 'en' ? null : {})),
    });

    await expect(load(client)).resolves.toBeUndefined();
  });
});
