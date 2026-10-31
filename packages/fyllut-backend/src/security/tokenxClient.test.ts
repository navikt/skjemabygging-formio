import { mockFetch, type RecordedRequest } from '@navikt/skjemadigitalisering-shared-backend/test';
import { config } from '../config/config';
import { extractHost, extractPath } from '../test/testHelpers';
import TokenXClient from './tokenxClient';

const { tokenx: tokenxConfig } = config;

const token_endpoint = `${extractHost(tokenxConfig.wellKnownUrl)}/token`;
const mockTokenxAccessToken = '123456';

describe('TokenX client', () => {
  const { instance: client } = TokenXClient;

  beforeEach(() => {
    mockWellKnown();
  });

  const mockWellKnown = () => {
    mockFetch(extractHost(tokenxConfig.wellKnownUrl))
      .get(extractPath(tokenxConfig.wellKnownUrl))
      .reply(200, { token_endpoint });
  };

  it('exchanges idporten jwt for a TokenX access token', async () => {
    const tokenxScope = mockFetch(extractHost(token_endpoint))
      .post(extractPath(token_endpoint))
      .reply(200, { access_token: mockTokenxAccessToken }, { 'Content-Type': 'application/json' });
    // eslint-disable-next-line no-useless-catch
    try {
      const accessToken = await client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a');
      expect(accessToken).toEqual(mockTokenxAccessToken);
    } catch (err) {
      throw err;
    }
    tokenxScope.done();
    expectExchangeRequestBody(tokenxScope.requests);
  });

  it('throws error when response from TokenX is not ok', async () => {
    const tokenxScope = mockFetch(extractHost(token_endpoint))
      .post(extractPath(token_endpoint))
      .reply(500, { message: 'Error occurred' }, { 'Content-Type': 'application/json' });

    await expect(client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a')).rejects.toMatchObject({
      message: 'Failed to exchange token',
      http_response_body: { message: 'Error occurred' },
    });

    tokenxScope.done();
    expectExchangeRequestBody(tokenxScope.requests);
  });

  const expectExchangeRequestBody = (requests: RecordedRequest[]) => {
    expect(requests).toHaveLength(1);
    const body = new URLSearchParams(requests[0].body);
    expect(body.get('subject_token')).toBe('idporten-jwt');
    expect(body.get('audience')).toBe('unittest-gcp:namespace:app-a');
  };
});
