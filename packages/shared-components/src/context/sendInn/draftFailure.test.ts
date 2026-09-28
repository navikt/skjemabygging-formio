import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getDraftFailureMetadata } from './draftFailure';

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
});
