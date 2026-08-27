import { describe, expect, it } from 'vitest';
import prepareSubmissionForTransport from './prepareSubmissionForTransport';

describe('prepareSubmissionForTransport', () => {
  it('removes renderer state and empty structures while preserving submission content', () => {
    expect(
      prepareSubmissionForTransport({
        data: {
          emptyArray: [],
          emptyObject: {},
          nullValue: null as unknown as object,
          value: 'text',
        },
        attachments: [],
        fyllutState: { mellomlagring: { isActive: true } },
      }),
    ).toEqual({
      data: {
        nullValue: null,
        value: 'text',
      },
      attachments: [],
    });
  });

  it('normalizes submissions without data', () => {
    expect(prepareSubmissionForTransport({ data: {} })).toEqual({ data: {} });
  });
});
