import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import errorHandler from './errorHandler';

describe('errorHandler', () => {
  const createResponse = () => {
    const res = {
      locals: {},
      header: vi.fn(),
      status: vi.fn(),
      contentType: vi.fn(),
      send: vi.fn(),
    };
    vi.mocked(res.status).mockReturnValue(res as any);
    vi.mocked(res.contentType).mockReturnValue(res as any);
    return res;
  };

  it('maps TOO_MANY_REQUESTS to status 429', () => {
    const res = createResponse();

    errorHandler(
      new ResponseError('TOO_MANY_REQUESTS', 'Too many requests', 'corr-id', 'wait'),
      {} as any,
      res as any,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'TOO_MANY_REQUESTS',
        correlation_id: 'corr-id',
      }),
    );
  });

  it('maps LOGIN_TIMEOUT to status 440', () => {
    const res = createResponse();

    errorHandler(
      new ResponseError('LOGIN_TIMEOUT', 'Login timeout', 'corr-id', 'login timeout'),
      {} as any,
      res as any,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(440);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'LOGIN_TIMEOUT',
        correlation_id: 'corr-id',
      }),
    );
  });
});
