import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { createEntraIdM2mHandler } from './entraIdM2mHandler';

const createRequest = (authorization?: string) =>
  ({
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

describe('entraIdM2mHandler', () => {
  it('bypasses auth in development/test mode', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl,
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: true,
    });

    await handler(createRequest(), createResponse(), next);

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(undefined);
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
    });

    await handler(createRequest('Bearer valid-m2m-token'), createResponse(), next);

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
    expect(requestInit?.body?.toString()).toBe('identity_provider=entra_id&token=valid-m2m-token');
    expect(spy).toHaveBeenCalledWith(undefined);
  });

  it('rejects requests without a bearer token', async () => {
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl: vi.fn<typeof fetch>(),
      introspectionEndpoint: 'https://token-introspection.example',
      isBypassed: false,
    });

    await handler(createRequest(), createResponse(), next);

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
    });

    await handler(createRequest('Bearer invalid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledWith(expect.any(ResponseError));
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'Invalid bearer token',
    });
  });

  it('fails when introspection endpoint configuration is missing', async () => {
    const { next, spy } = createNext();
    const handler = createEntraIdM2mHandler({
      fetchImpl: vi.fn<typeof fetch>(),
      introspectionEndpoint: undefined,
      isBypassed: false,
    });

    await handler(createRequest('Bearer valid-m2m-token'), createResponse(), next);

    expect(spy).toHaveBeenCalledWith(expect.any(ResponseError));
    expect(spy.mock.calls[0]?.[0]).toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Missing Entra ID introspection endpoint configuration',
    });
  });
});
