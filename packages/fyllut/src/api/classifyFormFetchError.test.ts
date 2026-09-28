import {
  FORM_NOT_PUBLISHED_MESSAGE,
  INVALID_FORM_PATH_MESSAGE,
  ResponseError,
} from '@navikt/skjemadigitalisering-shared-domain';
import { classifyFormFetchError, logFormFetchError } from './classifyFormFetchError';

describe('classifyFormFetchError', () => {
  it.each(['index.html', 'nav123456.php', 'nav-123456'])('ignores backend-rejected path %s', (path) => {
    expect(
      classifyFormFetchError(path, new ResponseError('BAD_REQUEST', INVALID_FORM_PATH_MESSAGE, 'request-id')),
    ).toEqual({
      report: false,
      status: 400,
      errorCode: 'BAD_REQUEST',
      correlationId: 'request-id',
    });
  });

  it('ignores a non-NAV path confirmed absent from the published directory', () => {
    expect(
      classifyFormFetchError('unknown-page', new ResponseError('NOT_FOUND', FORM_NOT_PUBLISHED_MESSAGE)).report,
    ).toBe(false);
  });

  it('keeps a NAV-looking form missing from the directory reportable until publication can be confirmed', () => {
    expect(classifyFormFetchError('nav123456', new ResponseError('NOT_FOUND', FORM_NOT_PUBLISHED_MESSAGE)).report).toBe(
      true,
    );
    expect(
      classifyFormFetchError('nav123456extra', new ResponseError('NOT_FOUND', FORM_NOT_PUBLISHED_MESSAGE)).report,
    ).toBe(true);
  });

  it.each([
    ['NOT_FOUND', 'not found', 404],
    ['BAD_REQUEST', 'A different bad request', 400],
    ['UNAUTHORIZED', 'Login required', 401],
    ['SERVICE_UNAVAILABLE', 'Forms service is unavailable', 503],
    ['TOO_MANY_REQUESTS', 'Rate limited', 429],
  ] as const)('reports ambiguous %s responses', (errorCode, message, status) => {
    expect(classifyFormFetchError('nav123456', new ResponseError(errorCode, message, 'request-id'))).toEqual({
      report: true,
      status,
      errorCode,
      correlationId: 'request-id',
    });
  });

  it('reports a browser network failure without logging its error text', () => {
    expect(classifyFormFetchError('nav123456', new Error('Failed to fetch /fyllut/api/forms/private'))).toEqual({
      report: true,
      status: 'unknown',
    });
  });

  it.each([502, 504])('reports the actual gateway status %i instead of the generic ERROR mapping', (status) => {
    const gatewayError = new ResponseError('ERROR', 'Gateway failure', undefined, undefined, status);
    expect(classifyFormFetchError('nav123456', gatewayError)).toMatchObject({ report: true, status });
  });

  it('does not invent an HTTP status for an ERROR without a response', () => {
    expect(classifyFormFetchError('nav123456', new ResponseError('ERROR', 'Unknown failure')).status).toBe('unknown');
  });

  it('leaves a correlated server error to the backend logger', () => {
    expect(
      classifyFormFetchError('nav123456', new ResponseError('INTERNAL_SERVER_ERROR', 'Server failure', 'request-id')),
    ).toEqual({
      report: false,
      status: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      correlationId: 'request-id',
    });
    expect(
      classifyFormFetchError('nav123456', new ResponseError('INTERNAL_SERVER_ERROR', 'Proxy failure')).report,
    ).toBe(true);
  });

  it('logs only the stable event and safe status context for reportable errors', () => {
    const logger = { error: vi.fn() };

    logFormFetchError(
      logger,
      'nav123456',
      new ResponseError('NOT_FOUND', 'Sensitive /fyllut/api/forms/nav123456', 'request-id'),
    );
    logFormFetchError(logger, 'nav123456', new Error('Failed to fetch a private URL'));
    logFormFetchError(logger, 'unknown-page', new ResponseError('NOT_FOUND', FORM_NOT_PUBLISHED_MESSAGE));

    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenNthCalledWith(1, 'Fyllut form fetch failed', {
      operation: 'form-fetch',
      status: 404,
      correlationId: 'request-id',
    });
    expect(logger.error).toHaveBeenNthCalledWith(2, 'Fyllut form fetch failed', {
      operation: 'form-fetch',
      status: 'unknown',
      correlationId: undefined,
    });
  });
});
