import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getDraftFailureMetadata, getSubmissionFailureLog, shouldLogDraftFailure } from './draftFailure';

describe('draft failure metadata', () => {
  it('keeps status and correlation ID without including the response message or form data', () => {
    const error = new ResponseError('BAD_REQUEST', 'Contains a submitted answer', 'correlation-123');

    expect(getDraftFailureMetadata('update', error)).toEqual({
      operation: 'update',
      errorCode: 'BAD_REQUEST',
      status: 400,
      correlationId: 'correlation-123',
    });
  });

  it('explains failures without response metadata instead of treating them as a successful save', () => {
    expect(getDraftFailureMetadata('create', new Error('Contains a submitted answer'))).toEqual({
      operation: 'create',
      errorCode: 'UNCLASSIFIED_ERROR',
      status: 'UNKNOWN',
    });
  });

  it('does not mislabel a local failure as an HTTP 500 response', () => {
    expect(
      getDraftFailureMetadata('fallback_update', new ResponseError('ERROR', 'Draft submission ID is missing')),
    ).toEqual({
      operation: 'fallback_update',
      errorCode: 'ERROR',
      status: 'UNKNOWN',
    });
  });

  it('leaves backend-alerted failures to the backend', () => {
    expect(shouldLogDraftFailure(new ResponseError('INTERNAL_SERVER_ERROR', 'Request failed', 'correlation-123'))).toBe(
      false,
    );
    expect(shouldLogDraftFailure(new ResponseError('ERROR', 'Request failed', 'correlation-123'))).toBe(false);
  });

  it('keeps failed saves alertable when backend error logging is not guaranteed', () => {
    expect(shouldLogDraftFailure(new ResponseError('BAD_REQUEST', 'Rejected', 'correlation-123'))).toBe(true);
    expect(shouldLogDraftFailure(new ResponseError('SERVICE_UNAVAILABLE', 'Unavailable', 'correlation-123'))).toBe(true);
    expect(shouldLogDraftFailure(new ResponseError('INTERNAL_SERVER_ERROR', 'Missing correlation'))).toBe(true);
    expect(shouldLogDraftFailure(new Error('Network failure'))).toBe(true);
  });

  it('records one submission failure if the fallback save succeeded', () => {
    expect(getSubmissionFailureLog(new ResponseError('SERVICE_UNAVAILABLE', 'Private answer', 'corr-123'))).toEqual({
      message: 'Draft submission failed',
      metadata: { operation: 'submit', errorCode: 'SERVICE_UNAVAILABLE', status: 503, correlationId: 'corr-123' },
    });
  });

  it('keeps both failure facts in a single safe event if the fallback save failed', () => {
    const failureLog = getSubmissionFailureLog(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Private answer', 'corr-123'),
      { error: new ResponseError('BAD_REQUEST', 'Another private answer', 'corr-456') },
    );

    expect(failureLog).toEqual({
      message: 'Draft persistence failed',
      metadata: {
        operation: 'fallback_update',
        errorCode: 'BAD_REQUEST',
        status: 400,
        correlationId: 'corr-456',
        submissionFailure: {
          operation: 'submit',
          errorCode: 'INTERNAL_SERVER_ERROR',
          status: 500,
          correlationId: 'corr-123',
        },
      },
    });
    expect(JSON.stringify(failureLog)).not.toContain('Private answer');
  });

  it('does not duplicate backend-alerted submission or fallback errors', () => {
    const backendError = new ResponseError('INTERNAL_SERVER_ERROR', 'Request failed', 'corr-123');
    expect(getSubmissionFailureLog(backendError)).toBeUndefined();
    expect(getSubmissionFailureLog(backendError, { error: backendError })).toBeUndefined();
  });
});
