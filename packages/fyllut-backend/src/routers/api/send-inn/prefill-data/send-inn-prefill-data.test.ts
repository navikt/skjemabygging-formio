import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { mockRequest, mockResponse } from '../../../../test/testHelpers';

const { getPrefillData } = vi.hoisted(() => ({
  getPrefillData: vi.fn(),
}));

vi.mock('../../../../services', () => ({
  prefillService: {
    getPrefillData,
  },
}));

import sendInnPrefillData from './send-inn-prefill-data';

describe('[endpoint] send-inn/prefill-data', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns prefill data on success', async () => {
    getPrefillData.mockResolvedValue({
      sokerFornavn: 'Ada',
    });

    const req = mockRequest({
      query: { properties: 'sokerFornavn,sokerEtternavn' },
    });
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnPrefillData.get(req, res, next);

    expect(getPrefillData).toHaveBeenCalledWith({
      accessToken: 'tokenx-access-token-for-unittest',
      properties: 'sokerFornavn,sokerEtternavn',
    });
    expect(res.json).toHaveBeenCalledWith({
      sokerFornavn: 'Ada',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('wraps ResponseError with prefill user-facing message', async () => {
    getPrefillData.mockRejectedValue(
      new HttpResponseError('NOT_FOUND', 'Upstream failed', { message: 'not found' }, 'corr-123'),
    );

    const req = mockRequest({});
    req.getTokenxAccessToken = () => 'tokenx-access-token-for-unittest';
    const res = mockResponse();
    const next = vi.fn();

    await sendInnPrefillData.get(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(ResponseError);
    expect(error.errorCode).toBe('NOT_FOUND');
    expect(error.correlationId).toBe('corr-123');
    expect(error.message).toBe('Feil ved kall til SendInn for preutfylling');
    expect(error.userMessage).toBe('Feil ved kall til SendInn for preutfylling');
  });
});
