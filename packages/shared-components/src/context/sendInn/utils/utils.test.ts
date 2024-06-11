import { transformSubmissionBeforeSubmitting } from './utils';

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
