import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-backend';
import { mockRequest } from '../test/testHelpers';
import globalErrorHandler from './globalErrorHandler';

describe('globalErrorHandler', () => {
  it('uses correlation_id fallback for ResponseError payloads', () => {
    const error = new HttpResponseError('SERVICE_UNAVAILABLE', 'Upstream failed', { reason: 'timeout' }) as any;
    error.correlation_id = 'test-correlation-id';

    const res = {
      locals: {},
      header: vi.fn(),
      status: vi.fn(),
      contentType: vi.fn(),
      send: vi.fn(),
    };
    vi.mocked(res.status).mockReturnValue(res as any);
    vi.mocked(res.contentType).mockReturnValue(res as any);

    globalErrorHandler(error, mockRequest({}), res as any, vi.fn());

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.send).toHaveBeenCalledWith({
      message: 'Upstream failed',
      errorCode: 'SERVICE_UNAVAILABLE',
      correlation_id: 'test-correlation-id',
      userMessage: undefined,
      body: { reason: 'timeout' },
    });
  });
});
