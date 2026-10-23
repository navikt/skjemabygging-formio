import { afterEach, describe, expect, it, vi } from 'vitest';
import translationClient from './translationClient';

const baseUrl = 'http://forms-api.example';

describe('translationClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('aborts a global translations request that does not respond within the timeout', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );

    await expect(
      translationClient.getGlobalTranslations({ baseUrl, languageCodes: ['en'], timeoutMs: 10 }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});
