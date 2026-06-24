import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { wrapResponseError } from './responseErrors';

describe('wrapResponseError', () => {
  it('normalizes authentication errors before they reach frontend callers', () => {
    const wrapped = wrapResponseError({
      error: new ResponseError('FORBIDDEN', 'Upstream denied request', 'corr-1', 'no access'),
      message: 'SendInn draft request failed',
      userMessage: 'Feil ved kall til SendInn.',
    });

    expect(wrapped).toEqual(
      new ResponseError(
        'INTERNAL_SERVER_ERROR',
        'SendInn draft request failed',
        'corr-1',
        'Feil ved kall til SendInn.',
      ),
    );
  });

  it('preserves non-auth response errors', () => {
    const wrapped = wrapResponseError({
      error: new ResponseError(
        'SERVICE_UNAVAILABLE',
        'Temporarily unavailable',
        'corr-2',
        'statiske.nologin.temporarilyUnavailable',
      ),
      message: 'Application submit failed',
    });

    expect(wrapped).toEqual(
      new ResponseError(
        'SERVICE_UNAVAILABLE',
        'Application submit failed',
        'corr-2',
        'statiske.nologin.temporarilyUnavailable',
      ),
    );
  });
});
