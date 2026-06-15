import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { isConflictError, toApiError } from './httpErrorUtils';

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

  it('ignores unrelated errors', () => {
    expect(isConflictError(new Error('Conflict'))).toBe(false);
    expect(toApiError(new Error('Conflict'))).toBeUndefined();
  });
});
