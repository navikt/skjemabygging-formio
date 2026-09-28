import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import express from 'express';
import request from 'supertest';
import { logger as errorLogger } from '../../../shared-backend/src/shared/logger/logger';
import { mockRequest } from '../test/testHelpers';
import { HttpError } from '../utils/errors/HttpError';
import legacyErrorToResponseError from './legacyErrorToResponseError';

describe('legacyErrorToResponseError', () => {
  it('preserves ResponseError status and correlation id fallback', () => {
    const error = new ResponseError('SERVICE_UNAVAILABLE', 'Upstream failed') as ResponseError & {
      correlation_id?: string;
    };
    error.correlation_id = 'test-correlation-id';
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    const forwardedError = next.mock.calls[0][0];
    expect(forwardedError).toBeInstanceOf(ResponseError);
    expect(forwardedError).toMatchObject({
      message: 'Upstream failed',
      errorCode: 'SERVICE_UNAVAILABLE',
      correlationId: 'test-correlation-id',
      userMessage: undefined,
    });
  });

  it('normalizes functional HttpError into ResponseError for the shared handler', () => {
    const error = new HttpError('Feil ved generering av førsteside');
    error.functional = true;
    error.correlation_id = 'test-correlation-id';
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Feil ved generering av førsteside',
      errorCode: 'INTERNAL_SERVER_ERROR',
      correlationId: 'test-correlation-id',
      userMessage: 'Feil ved generering av førsteside',
    });
  });

  it('maps a body-parser request abort to a safe bad request without exposing the parser error', () => {
    const error = Object.assign(new Error('request aborted'), {
      type: 'request.aborted',
      status: 400,
      received: 10,
      expected: 100,
    });
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toMatchObject({
      errorCode: 'BAD_REQUEST',
      message: 'Request body was aborted.',
    });
    expect(next.mock.calls[0][0].message).not.toContain('10');
  });

  it('responds with 400 and logs an abort once below error level', async () => {
    const app = express();
    const handlerWarning = vi.spyOn(errorLogger, 'warn');
    const handlerError = vi.spyOn(errorLogger, 'error');
    app.post('/body', (_req, _res, next) =>
      next(Object.assign(new Error('request aborted'), { type: 'request.aborted', status: 400 })),
    );
    app.use(legacyErrorToResponseError);
    app.use(errorHandler);

    const response = await request(app).post('/body').expect(400);

    expect(response.body).toMatchObject({ errorCode: 'BAD_REQUEST', message: 'Request body was aborted.' });
    expect(handlerWarning).toHaveBeenCalledOnce();
    expect(handlerError).not.toHaveBeenCalled();
    handlerWarning.mockRestore();
    handlerError.mockRestore();
  });

  it('does not mask unexpected body-parser failures as aborted requests', () => {
    const error = Object.assign(new Error('stream not readable'), { type: 'stream.not.readable', status: 500 });
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Det oppstod en feil',
    });
  });

  it('masks plain errors until routes are migrated to ResponseError', () => {
    const error = new Error('secret implementation detail') as Error & { correlation_id?: string };
    error.correlation_id = 'test-correlation-id';
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    expect(next.mock.calls[0][0]).toMatchObject({
      message: 'Det oppstod en feil',
      errorCode: 'INTERNAL_SERVER_ERROR',
      correlationId: 'test-correlation-id',
      userMessage: 'Det oppstod en feil',
    });
  });

  it('passes explicit ResponseError through unchanged', () => {
    const error = new ResponseError('BAD_REQUEST', 'Bad request', 'corr-id', 'Bad request');
    const next = vi.fn();

    legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

    expect(next.mock.calls[0][0]).toBe(error);
  });
});
