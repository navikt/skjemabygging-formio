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
