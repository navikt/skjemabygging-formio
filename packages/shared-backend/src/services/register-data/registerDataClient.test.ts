import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import registerDataClient from './registerDataClient';

describe('registerDataClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('forwards access token and query params to Tilleggsstonader', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: 'A1', tekst: 'Aktivitet', type: 'TILTAK' }]), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const result = await registerDataClient.getActivities({
      baseUrl: 'http://tilleggsstonader',
      accessToken: 'tokenx-token',
      query: {
        dagligreise: 'true',
        aktivitet: ['A1', 'A2'],
        tom: '',
        ignorer: undefined,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://tilleggsstonader/api/ekstern/aktivitet?dagligreise=true&aktivitet=A1&aktivitet=A2&tom=',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer tokenx-token',
        }),
      }),
    );
    expect(result).toEqual([{ id: 'A1', tekst: 'Aktivitet', type: 'TILTAK' }]);
  });
});
