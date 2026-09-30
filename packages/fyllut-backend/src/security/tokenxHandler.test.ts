import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { mockRequest, mockResponse } from '../test/testHelpers';
import TokenXClient from './tokenxClient';
import tokenxHandler from './tokenxHandler';

describe('tokenxHandler', () => {
  const targetClientId = 'send-inn-client';

  afterEach(() => vi.restoreAllMocks());

  it('rejects a missing ID-porten JWT without exchanging a token or continuing', async () => {
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken');
    const req = mockRequest({});
    const next = vi.fn();

    await tokenxHandler(targetClientId)(req, mockResponse(), next);

    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'ID-porten authentication is required',
    } satisfies Partial<ResponseError>);
    expect(exchangeToken).not.toHaveBeenCalled();
    expect(req.getTokenxAccessToken).toBeUndefined();
  });

  it('exchanges a validated ID-porten JWT and continues once', async () => {
    const exchangeToken = vi.spyOn(TokenXClient.instance, 'exchangeToken').mockResolvedValue('exchanged-token');
    const req = mockRequest({});
    req.getIdportenJwt = () => 'idporten-token';
    const next = vi.fn();

    await tokenxHandler(targetClientId)(req, mockResponse(), next);

    expect(exchangeToken).toHaveBeenCalledWith('idporten-token', targetClientId);
    expect(req.getTokenxAccessToken()).toBe('exchanged-token');
    expect(next).toHaveBeenCalledExactlyOnceWith();
  });

  it('forwards a failed exchange once without continuing the request', async () => {
    const failure = new Error('TokenX unavailable');
    vi.spyOn(TokenXClient.instance, 'exchangeToken').mockRejectedValue(failure);
    const req = mockRequest({});
    req.getIdportenJwt = () => 'idporten-token';
    const next = vi.fn();

    await tokenxHandler(targetClientId)(req, mockResponse(), next);

    expect(next).toHaveBeenCalledExactlyOnceWith(failure);
    expect(req.getTokenxAccessToken).toBeUndefined();
  });
});
