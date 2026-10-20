import { describe, expect, it, vi } from 'vitest';
import { createPublishedTranslationService } from './publishedTranslationService';

const baseUrl = 'http://forms-api.example';
const ttlMs = 1000;

const setup = (getPublishedGlobalTranslations = vi.fn()) => {
  let time = 0;
  const service = createPublishedTranslationService({
    baseUrl,
    ttlMs,
    client: { getPublishedGlobalTranslations },
    now: () => time,
  });
  return { service, getPublishedGlobalTranslations, advance: (ms: number) => (time += ms) };
};

describe('createPublishedTranslationService', () => {
  it('fetches with a 5 second timeout and maps translations for the language', async () => {
    const { service, getPublishedGlobalTranslations } = setup(vi.fn().mockResolvedValue({ Ja: 'Yes' }));

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledWith({ baseUrl, languageCode: 'en', timeoutMs: 5000 });
  });

  it('serves from cache within the TTL', async () => {
    const { service, getPublishedGlobalTranslations, advance } = setup(vi.fn().mockResolvedValue({ Ja: 'Yes' }));

    await service.getGlobalTranslations('en');
    advance(ttlMs - 1);
    await service.getGlobalTranslations('en');

    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(1);
  });

  it('caches each language separately', async () => {
    const { service, getPublishedGlobalTranslations } = setup(
      vi.fn().mockImplementation(({ languageCode }) => Promise.resolve({ Ja: languageCode })),
    );

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'en' } });
    await expect(service.getGlobalTranslations('nn')).resolves.toEqual({ Ja: { nn: 'nn' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(2);
  });

  it('refreshes after the TTL', async () => {
    const { service, advance } = setup(
      vi.fn().mockResolvedValueOnce({ Ja: 'Yes' }).mockResolvedValueOnce({ Ja: 'Yes!' }),
    );

    await service.getGlobalTranslations('en');
    advance(ttlMs);

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes!' } });
  });

  it('serves stale content for the TTL after a failed refresh', async () => {
    const { service, getPublishedGlobalTranslations, advance } = setup(
      vi
        .fn()
        .mockResolvedValueOnce({ Ja: 'Yes' })
        .mockRejectedValueOnce(new Error('forms-api down'))
        .mockResolvedValueOnce({ Ja: 'Updated' }),
    );

    await service.getGlobalTranslations('en');
    advance(ttlMs);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    advance(ttlMs - 1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(2);

    advance(1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Updated' } });
  });

  it('serves an empty map for the TTL when nothing is cached and the fetch fails', async () => {
    const { service, getPublishedGlobalTranslations, advance } = setup(
      vi.fn().mockRejectedValueOnce(new Error('forms-api down')).mockResolvedValueOnce({ Ja: 'Yes' }),
    );

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({});
    advance(ttlMs - 1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({});
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(1);

    advance(1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
  });
});
