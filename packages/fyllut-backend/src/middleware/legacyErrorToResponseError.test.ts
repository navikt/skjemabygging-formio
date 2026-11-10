import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
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
