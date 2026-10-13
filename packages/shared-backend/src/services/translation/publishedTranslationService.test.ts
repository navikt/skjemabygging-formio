import { afterEach, describe, expect, it, vi } from 'vitest';
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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fetches and maps translations for the language', async () => {
    const { service, getPublishedGlobalTranslations } = setup(vi.fn().mockResolvedValue({ Ja: 'Yes' }));

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledWith({ baseUrl, languageCode: 'en' });
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

  it('serves stale content when the refresh fails', async () => {
    const { service, advance } = setup(
      vi.fn().mockResolvedValueOnce({ Ja: 'Yes' }).mockRejectedValueOnce(new Error('forms-api down')),
    );

    await service.getGlobalTranslations('en');
    advance(ttlMs);

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
  });

  it('backs off after a failed refresh and recovers after 30 seconds', async () => {
    const { service, getPublishedGlobalTranslations, advance } = setup(
      vi
        .fn()
        .mockResolvedValueOnce({ Ja: 'Yes' })
        .mockRejectedValueOnce(new Error('forms-api down'))
        .mockResolvedValueOnce({ Ja: 'Updated' }),
    );

    await service.getGlobalTranslations('en');
    advance(ttlMs);
    await service.getGlobalTranslations('en');
    advance(30_000 - 1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(2);

    advance(1);
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Updated' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(3);
  });

  it.each([false, true])('bounds a stalled fetch to 5 seconds (cached: %s)', async (cached) => {
    vi.useFakeTimers();
    vi.spyOn(AbortSignal, 'timeout').mockImplementation((ms) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), ms);
      return controller.signal;
    });
    const fetch = vi.spyOn(global, 'fetch');
    if (cached) {
      fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ Ja: 'Yes' }), { headers: { 'Content-Type': 'application/json' } }),
      );
    }
    fetch.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => reject(options.signal?.reason));
        }),
    );
    const service = createPublishedTranslationService({ baseUrl, ttlMs });
    if (cached) {
      await service.getGlobalTranslations('en');
      await vi.advanceTimersByTimeAsync(ttlMs);
    }

    const request = service.getGlobalTranslations('en');
    const concurrentRequest = service.getGlobalTranslations('en');
    const settled = vi.fn();
    void request.then(settled);
    await vi.advanceTimersByTimeAsync(4999);
    expect(settled).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);

    const expected = cached ? { Ja: { en: 'Yes' } } : {};
    await expect(request).resolves.toEqual(expected);
    await expect(concurrentRequest).resolves.toEqual(expected);
    expect(AbortSignal.timeout).toHaveBeenLastCalledWith(5000);
    expect(fetch).toHaveBeenCalledTimes(cached ? 2 : 1);
  });

  it('retries on the next call after a failure', async () => {
    const { service, getPublishedGlobalTranslations } = setup(
      vi.fn().mockRejectedValueOnce(new Error('forms-api down')).mockResolvedValueOnce({ Ja: 'Yes' }),
    );

    await expect(service.getGlobalTranslations('en')).resolves.toEqual({});
    await expect(service.getGlobalTranslations('en')).resolves.toEqual({ Ja: { en: 'Yes' } });
    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(2);
  });

  it('returns an empty map when nothing is cached and the fetch fails', async () => {
    const { service } = setup(vi.fn().mockRejectedValue(new Error('forms-api down')));

    await expect(service.getGlobalTranslations('nn')).resolves.toEqual({});
  });

  it('shares one request between concurrent calls', async () => {
    const { service, getPublishedGlobalTranslations } = setup(vi.fn().mockResolvedValue({ Ja: 'Yes' }));

    await Promise.all([service.getGlobalTranslations('en'), service.getGlobalTranslations('en')]);

    expect(getPublishedGlobalTranslations).toHaveBeenCalledTimes(1);
  });
});
