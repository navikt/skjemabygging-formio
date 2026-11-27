import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request } from 'express';
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

  describe('client aborts', () => {
    const requestWith = (state: { complete: boolean; destroyed: boolean }) =>
      ({ ...mockRequest({}), ...state }) as Request;
    const disconnectedBeforeBody = requestWith({ complete: false, destroyed: true });

    it.each([
      ['body parser', Object.assign(new Error('request aborted'), { type: 'request.aborted', status: 400 })],
      ['multer', new Error('Request aborted')],
      ['multer on close', new Error('Request closed')],
    ])('maps %s aborts to BAD_REQUEST when the client disconnected before the body was received', (_source, error) => {
      const next = vi.fn();

      legacyErrorToResponseError(error, disconnectedBeforeBody, {} as any, next);

      expect(next.mock.calls[0][0]).toMatchObject({
        message: 'Request aborted by client.',
        errorCode: 'BAD_REQUEST',
      });
    });

    it.each([
      ['the body was fully received', new Error('Request aborted'), requestWith({ complete: true, destroyed: true })],
      [
        'the connection is still open',
        new Error('Request aborted'),
        requestWith({ complete: false, destroyed: false }),
      ],
      ['the error is unrelated', new Error('Upstream failed'), disconnectedBeforeBody],
    ])('keeps INTERNAL_SERVER_ERROR when %s', (_case, error, req) => {
      const next = vi.fn();

      legacyErrorToResponseError(error, req, {} as any, next);

      expect(next.mock.calls[0][0]).toMatchObject({
        message: 'Det oppstod en feil',
        errorCode: 'INTERNAL_SERVER_ERROR',
      });
    });
  });

  it.each(['BAD_REQUEST', 'NOT_FOUND', 'FORBIDDEN', 'SERVICE_UNAVAILABLE'] as const)(
    'passes explicit %s ResponseError through unchanged',
    (errorCode) => {
      const error = new ResponseError(errorCode, 'Request failed', 'corr-id', 'Request failed');
      const next = vi.fn();

      legacyErrorToResponseError(error, mockRequest({}), {} as any, next);

      expect(next.mock.calls[0][0]).toBe(error);
    },
  );
});
