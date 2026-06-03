import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { EntraIdHandlerLogger } from './entraIdHandler';
import { createEntraIdM2mHandler, createEntraIdOboHandler } from './entraIdHandler';

const createRequest = (authorization?: string) =>
  ({
    method: 'GET',
    path: '/api/forms/nav123456/spec',
    header: (name: string) => (name === 'Authorization' ? authorization : undefined),
  }) as Request;

const createResponse = () =>
  ({
    locals: {},
  }) as Response;

const createNext = () => {
  const spy = vi.fn();
  const next = ((error?: unknown) => {
    spy(error);
  }) as NextFunction;

  return { next, spy };
};

const createLogger = (): EntraIdHandlerLogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
});

describe('createEntraIdM2mHandler', () => {
  it('throws when auth is enabled without an introspection endpoint', () => {
    expect(() =>
      createEntraIdM2mHandler({
        fetchImpl: vi.fn<typeof fetch>(),
        introspectionEndpoint: undefined,
        isBypassed: false,
        logger: createLogger(),
      }),
    ).toThrowError('Missing Entra ID introspection endpoint configuration');
  });

  it('accepts an active Entra ID bearer token', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ active: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest('Bearer valid+token=&m2m'), createResponse(), next);

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://token-introspection.example',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
        body: expect.any(URLSearchParams),
      }),
    );

    const requestInit = fetchImpl.mock.calls[0]?.[1];
    expect(requestInit?.body?.toString()).toBe('identity_provider=entra_id&token=valid%2Btoken%3D%26m2m');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(undefined);
  });

  it('rejects requests without a bearer token', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest(), createResponse(), next);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(ResponseError));
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'Missing bearer token',
    });
  });

  it('rejects requests with an inactive bearer token', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ active: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest('Bearer invalid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.any(ResponseError));
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'Invalid bearer token',
    });
  });

  it('returns service unavailable when token introspection fetch fails', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new Error('network error'));
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest('Bearer valid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to introspect bearer token',
    });
  });

  it('returns service unavailable when token introspection responds with a non-ok status', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ active: true }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest('Bearer valid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to introspect bearer token',
    });
  });

  it('returns an internal server error when the introspection response is invalid json', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('not-json', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
      logger: createLogger(),
    });

    await handler(createRequest('Bearer valid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to parse token introspection response',
    });
  });
});

describe('createEntraIdOboHandler', () => {
  it('bypasses auth when configured', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const { next, spy } = createNext();
    const handler = createEntraIdOboHandler({
      fetchImpl,
      introspectionEndpoint: undefined,
      isBypassed: true,
      logger: createLogger(),
    });

    await handler(createRequest(), createResponse(), next);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(undefined);
  });
});
