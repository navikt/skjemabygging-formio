import { describe, expect, it, vi } from 'vitest';
import { createLogger, createNext, createRequest, createResponse, jsonResponse } from './testUtils';
import { createTokenxHandler, getTokenxToken } from './tokenxHandler';

const exchangeEndpoint = 'http://texas.example/exchange';
const audience = 'dev-gcp:team-soknad:innsending-api';
const signedInLocals = () => ({ idportenUser: { pid: '12345678910', token: 'user-token' } });

const setup = (fetchImpl: typeof fetch) => createTokenxHandler({ exchangeEndpoint, logger: createLogger(), fetchImpl });

describe('createTokenxHandler', () => {
  it('throws without an exchange endpoint', () => {
    expect(() => createTokenxHandler({ exchangeEndpoint: '', logger: createLogger() })).toThrowError(
      'Missing TokenX exchange endpoint configuration',
    );
  });

  it('exchanges the ID-porten token for the audience', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ access_token: 'tokenx-token' }));
    const res = createResponse(signedInLocals());
    const { next, spy } = createNext();

    await setup(fetchImpl)(audience)(createRequest(), res, next);

    expect(spy).toHaveBeenCalledWith(undefined);
    expect(getTokenxToken(res, audience)).toBe('tokenx-token');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(exchangeEndpoint);
    expect(Object.fromEntries(init?.body as URLSearchParams)).toEqual({
      identity_provider: 'tokenx',
      target: audience,
      user_token: 'user-token',
    });
  });

  it('keeps tokens for several audiences', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'first' }))
      .mockResolvedValueOnce(jsonResponse({ access_token: 'second' }));
    const handler = setup(fetchImpl);
    const res = createResponse(signedInLocals());

    await handler('cluster:ns:first')(createRequest(), res, createNext().next);
    await handler('cluster:ns:second')(createRequest(), res, createNext().next);

    expect(getTokenxToken(res, 'cluster:ns:first')).toBe('first');
    expect(getTokenxToken(res, 'cluster:ns:second')).toBe('second');
  });

  it('passes SERVICE_UNAVAILABLE to next when Texas fails', async () => {
    const { next, spy } = createNext();

    await setup(vi.fn<typeof fetch>().mockResolvedValue(new Response('error', { status: 400 })))(audience)(
      createRequest(),
      createResponse(signedInLocals()),
      next,
    );

    expect(spy.mock.calls[0][0]).toMatchObject({ errorCode: 'SERVICE_UNAVAILABLE' });
  });

  it('passes an error to next when requireIdporten has not run', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const { next, spy } = createNext();

    await setup(fetchImpl)(audience)(createRequest(), createResponse(), next);

    expect(spy.mock.calls[0][0]).toMatchObject({ errorCode: 'INTERNAL_SERVER_ERROR' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
