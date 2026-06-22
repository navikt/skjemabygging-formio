import type { MockInstance } from 'vitest';
import { createRegisterDataService } from './registerDataService';

describe('createRegisterDataService', () => {
  const baseUrl = 'http://tilleggsstonader';

  const createService = () =>
    createRegisterDataService({
      baseUrl,
    });

  const mockFetchResponse = (body: BodyInit, status: number, contentType: string) =>
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, {
        status,
        headers: {
          'Content-Type': contentType,
        },
      }),
    );

  const expectGetRequest = (fetchSpy: MockInstance<typeof fetch>) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://tilleggsstonader/api/ekstern/aktivitet?dagligreise=true&aktivitet=A1&aktivitet=A2&tom=',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer tokenx-token',
          'Content-Type': 'application/json',
        }),
      }),
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets and maps Tilleggsstonader activities through the client endpoint', async () => {
    const fetchSpy = mockFetchResponse(
      JSON.stringify([
        { id: 'A1', tekst: 'Aktivitet 1', type: 'TILTAK' },
        { id: 'A2', tekst: 'Aktivitet 2', type: 'UTDANNING' },
      ]),
      200,
      'application/json',
    );
    const service = createService();

    await expect(
      service.getActivities({
        accessToken: 'tokenx-token',
        query: { dagligreise: 'true', aktivitet: ['A1', 'A2'], tom: '', ignorer: undefined },
      }),
    ).resolves.toEqual([
      { value: 'A1', label: 'Aktivitet 1', type: 'TILTAK' },
      { value: 'A2', label: 'Aktivitet 2', type: 'UTDANNING' },
    ]);
    expectGetRequest(fetchSpy);
  });

  it('maps json error responses from the client endpoint', async () => {
    mockFetchResponse(
      JSON.stringify({ message: 'Tilleggsstonader unavailable', correlationId: 'corr-1' }),
      503,
      'application/json',
    );
    const service = createService();

    await expect(
      service.getActivities({
        accessToken: 'tokenx-token',
      }),
    ).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Tilleggsstonader unavailable',
      correlationId: 'corr-1',
    });
  });
});
