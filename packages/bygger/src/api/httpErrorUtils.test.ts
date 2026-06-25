import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { hasErrorCode, isConflictError, toApiError } from './httpErrorUtils';

describe('httpErrorUtils', () => {
  it('handles ResponseError instances', () => {
    const error = new ResponseError('CONFLICT', 'Conflict');

    expect(isConflictError(error)).toBe(true);
    expect(toApiError(error)?.httpStatus).toBe(409);
  });

  it('handles ResponseError-like objects from built bundles', () => {
    const error = {
      errorCode: 'CONFLICT',
      message: 'Conflict',
    };

    expect(isConflictError(error)).toBe(true);
    expect(toApiError(error)?.httpStatus).toBe(409);
  });

  it('matches other response error codes structurally', () => {
    const error = {
      errorCode: 'METHOD_NOT_ALLOWED',
      message: 'Method Not Allowed',
    };

    expect(hasErrorCode(error, 'METHOD_NOT_ALLOWED')).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isConflictError(new Error('Conflict'))).toBe(false);
    expect(hasErrorCode(new Error('Method Not Allowed'), 'METHOD_NOT_ALLOWED')).toBe(false);
    expect(toApiError(new Error('Conflict'))).toBeUndefined();
  });
});
