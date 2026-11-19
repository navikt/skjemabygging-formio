import texasClient from './texasClient';

const endpoint = 'http://texas/introspect';
const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const introspect = (fetchImpl: typeof fetch) =>
  texasClient.introspect({ endpoint, fetchImpl, identityProvider: 'idporten', token: 'token' });

describe('texasClient', () => {
  it('retries a network error', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('connection refused'))
      .mockResolvedValue(jsonResponse({ active: true }));

    await expect(introspect(fetchImpl)).resolves.toEqual({ active: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('gives up after three failed attempts', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response('error', { status: 503 }));

    await expect(introspect(fetchImpl)).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('does not retry a client error', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response('bad request', { status: 400 }));

    await expect(introspect(fetchImpl)).rejects.toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe('texasClient.token', () => {
  const token = (fetchImpl: typeof fetch) =>
    texasClient.token({
      endpoint: 'http://texas/token',
      fetchImpl,
      identityProvider: 'entra_id',
      target: 'api://test/.default',
    });

  it('requests a machine-to-machine token for the target', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ access_token: 'texas-token' }));

    await expect(token(fetchImpl)).resolves.toBe('texas-token');
    const body = fetchImpl.mock.calls[0][1]?.body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({ identity_provider: 'entra_id', target: 'api://test/.default' });
  });

  it('rejects a response without an access token', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}));

    await expect(token(fetchImpl)).rejects.toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });
  });
});
