import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadRemoteOptions } from './useRemoteOptions';

describe('loadRemoteOptions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns options from the endpoint', async () => {
    const options: ComponentValue[] = [{ label: 'Euro (EUR)', value: 'EUR' }];
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(options), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(loadRemoteOptions('/fyllut/api/common-codes/currencies')).resolves.toEqual(options);
  });

  it('fetches again for repeated calls to the same url', async () => {
    const options: ComponentValue[] = [{ label: 'Euro (EUR)', value: 'EUR' }];
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response(JSON.stringify(options), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    await loadRemoteOptions('/fyllut/api/common-codes/currencies');
    await loadRemoteOptions('/fyllut/api/common-codes/currencies');

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('throws when the endpoint fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 500 }));

    await expect(loadRemoteOptions('/fyllut/api/common-codes/currencies')).rejects.toThrow(
      'Failed to load remote options: 500',
    );
  });
});
