import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { base64Encode, requireBase64Decode } from './base64';

describe('base64 utils', () => {
  it('returns decoded buffer when input exists', () => {
    const result = requireBase64Decode(base64Encode('hello'), 'Failed to decode generated application PDF');

    expect(result.toString('utf-8')).toBe('hello');
  });

  it('throws response error when input is missing', () => {
    expect(() => requireBase64Decode(undefined, 'Failed to decode generated application PDF')).toThrow(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Failed to decode generated application PDF'),
    );
  });
});
