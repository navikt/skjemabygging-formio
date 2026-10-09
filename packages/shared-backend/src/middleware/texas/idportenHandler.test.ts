import { describe, expect, it, vi } from 'vitest';
import { createIdportenAuth, getIdportenUser } from './idportenHandler';
import { createLogger, createNext, createRequest, createResponse, jsonResponse } from './testUtils';

const introspectionEndpoint = 'http://texas.example/introspect';
const pid = '12345678910';
const activeClaims = { active: true, acr: 'idporten-loa-high', pid };

const setup = (fetchImpl: typeof fetch) => {
  const logger = createLogger();
  return { ...createIdportenAuth({ introspectionEndpoint, logger, fetchImpl }), logger };
};

describe('createIdportenAuth', () => {
  it('throws without an introspection endpoint', () => {
    expect(() => createIdportenAuth({ introspectionEndpoint: '', logger: createLogger() })).toThrowError(
      'Missing ID-porten introspection endpoint configuration',
    );
  });

  describe('authenticate', () => {
    it('sends the token to Texas with the idporten identity provider', async () => {
      const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(activeClaims));
      const { authenticate } = setup(fetchImpl);

      await authenticate(createRequest('Bearer user-token'));

      const [url, init] = fetchImpl.mock.calls[0];
      expect(url).toBe(introspectionEndpoint);
      expect(init?.method).toBe('POST');
      expect(Object.fromEntries(init?.body as URLSearchParams)).toEqual({
        identity_provider: 'idporten',
        token: 'user-token',
      });
    });

    it.each(['idporten-loa-high', 'Level4'])('returns pid and token for acr %s', async (acr) => {
      const { authenticate } = setup(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ...activeClaims, acr })));

      await expect(authenticate(createRequest('Bearer user-token'))).resolves.toEqual({ pid, token: 'user-token' });
    });

    it.each([undefined, '', 'Basic abc', 'Bearer '])(
      'returns undefined without calling Texas for header %j',
      async (header) => {
        const fetchImpl = vi.fn<typeof fetch>();
        const { authenticate } = setup(fetchImpl);

        await expect(authenticate(createRequest(header))).resolves.toBeUndefined();
        expect(fetchImpl).not.toHaveBeenCalled();
      },
    );

    it('returns undefined for an inactive token', async () => {
      const { authenticate } = setup(
        vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ active: false, error: 'token is expired' })),
      );

      await expect(authenticate(createRequest('Bearer user-token'))).resolves.toBeUndefined();
    });

    it.each(['idporten-loa-substantial', 'Level3', undefined])('returns undefined for acr %s', async (acr) => {
      const { authenticate } = setup(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ...activeClaims, acr })));

      await expect(authenticate(createRequest('Bearer user-token'))).resolves.toBeUndefined();
    });

    it('returns undefined without pid', async () => {
      const { authenticate } = setup(
        vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ active: true, acr: 'idporten-loa-high' })),
      );

      await expect(authenticate(createRequest('Bearer user-token'))).resolves.toBeUndefined();
    });

    it('throws SERVICE_UNAVAILABLE when Texas fails', async () => {
      const { authenticate } = setup(vi.fn<typeof fetch>().mockResolvedValue(new Response('error', { status: 500 })));

      await expect(authenticate(createRequest('Bearer user-token'))).rejects.toMatchObject({
        errorCode: 'SERVICE_UNAVAILABLE',
      });
    });

    it('never logs pid or token', async () => {
      const { authenticate, logger } = setup(
        vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ active: true, acr: 'Level3', pid })),
      );

      await authenticate(createRequest('Bearer user-token'));

      const logged = JSON.stringify([logger.debug, logger.info, logger.warn].map((fn) => vi.mocked(fn).mock.calls));
      expect(logged).not.toContain(pid);
      expect(logged).not.toContain('user-token');
    });
  });

  describe('requireIdporten', () => {
    it('stores the user and calls next without error', async () => {
      const { requireIdporten } = setup(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(activeClaims)));
      const res = createResponse();
      const { next, spy } = createNext();

      await requireIdporten(createRequest('Bearer user-token'), res, next);

      expect(spy).toHaveBeenCalledWith(undefined);
      expect(getIdportenUser(res)).toEqual({ pid, token: 'user-token' });
    });

    it('passes UNAUTHORIZED to next without a valid session', async () => {
      const { requireIdporten } = setup(vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ active: false })));
      const { next, spy } = createNext();

      await requireIdporten(createRequest('Bearer user-token'), createResponse(), next);

      expect(spy.mock.calls[0][0]).toMatchObject({ errorCode: 'UNAUTHORIZED' });
    });

    it('passes Texas failures to next', async () => {
      const { requireIdporten } = setup(vi.fn<typeof fetch>().mockRejectedValue(new Error('connection refused')));
      const { next, spy } = createNext();

      await requireIdporten(createRequest('Bearer user-token'), createResponse(), next);

      expect(spy.mock.calls[0][0]).toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
    });
  });

  describe('getIdportenUser', () => {
    it('throws when requireIdporten has not run', () => {
      expect(() => getIdportenUser(createResponse())).toThrowError(/requireIdporten must run/);
    });
  });
});
