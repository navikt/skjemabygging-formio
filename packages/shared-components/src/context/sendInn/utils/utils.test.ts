import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { isNotFoundError, transformSubmissionBeforeSubmitting } from './utils';

describe('isNotFoundError', () => {
  it('recognizes a local not-found response error', () => {
    expect(isNotFoundError(new ResponseError('NOT_FOUND', 'Draft not found'))).toBe(true);
  });

  it('recognizes a not-found response error from another bundle', () => {
    class BundledResponseError extends Error {
      readonly errorCode = 'NOT_FOUND';
    }

    const error = new BundledResponseError('Draft not found');

    expect(error).not.toBeInstanceOf(ResponseError);
    expect(isNotFoundError(error)).toBe(true);
  });

  it.each([
    new ResponseError('INTERNAL_SERVER_ERROR', 'Save failed'),
    new ResponseError('UNAUTHORIZED', 'Authentication required'),
    new Error('Network failure'),
    { errorCode: 'NOT_FOUND' },
    null,
    undefined,
  ])('does not classify other failures as not found: %s', (error) => {
    expect(isNotFoundError(error)).toBe(false);
  });
});

describe('transformSubmissionBeforeSubmitting', () => {
  const fyllutState = { mellomlagring: { isActive: true } };

  it('removes fyllutState', () => {
    expect(
      transformSubmissionBeforeSubmitting({
        data: { field1: 'text' },
        fyllutState,
      }),
    ).toEqual({ data: { field1: 'text' } });
  });

  it('removes empty objects and arrays', () => {
    expect(
      transformSubmissionBeforeSubmitting({
        data: { container1: {}, field1: 'text', list: [] },
      }),
    ).toEqual({ data: { field1: 'text' } });
  });

  it('does not remove null', () => {
    expect(
      transformSubmissionBeforeSubmitting({
        data: { emptyField1: null, field: 'text', emptyField2: null },
      } as any),
    ).toEqual({
      data: { emptyField1: null, field: 'text', emptyField2: null },
    });
  });

  it('handles undefined', () => {
    expect(transformSubmissionBeforeSubmitting(undefined as any)).toEqual({ data: {} });
  });

  it('handles empty submission', () => {
    expect(transformSubmissionBeforeSubmitting({} as any)).toEqual({ data: {} });
  });

  it('handles submission with empty data', () => {
    expect(transformSubmissionBeforeSubmitting({ data: {} } as any)).toEqual({ data: {} });
  });
});
