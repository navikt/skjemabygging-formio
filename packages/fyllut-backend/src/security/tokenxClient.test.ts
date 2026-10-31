import { config } from '../config/config';
import { extractHost } from '../test/testHelpers';
import TokenXClient from './tokenxClient';

const { tokenx: tokenxConfig } = config;

const token_endpoint = `${extractHost(tokenxConfig.wellKnownUrl)}/token`;
const mockTokenxAccessToken = '123456';

describe('TokenX client', () => {
  const { instance: client } = TokenXClient;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The client caches the token endpoint, so well-known is only fetched on first use.
  const mockTokenx = (tokenResponse: Response) =>
    vi
      .spyOn(global, 'fetch')
      .mockImplementation(async (input) =>
        String(input) === tokenxConfig.wellKnownUrl ? Response.json({ token_endpoint }) : tokenResponse,
      );

  const expectExchangeRequest = (fetchSpy: ReturnType<typeof mockTokenx>) => {
    const tokenCalls = fetchSpy.mock.calls.filter(([input]) => String(input) === token_endpoint);
    expect(tokenCalls).toHaveLength(1);
    const body = new URLSearchParams(String(tokenCalls[0][1]?.body));
    expect(body.get('subject_token')).toBe('idporten-jwt');
    expect(body.get('audience')).toBe('unittest-gcp:namespace:app-a');
  };

  it('exchanges idporten jwt for a TokenX access token', async () => {
    const fetchSpy = mockTokenx(Response.json({ access_token: mockTokenxAccessToken }));

    const accessToken = await client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a');

    expect(accessToken).toEqual(mockTokenxAccessToken);
    expectExchangeRequest(fetchSpy);
  });

  it('throws error when response from TokenX is not ok', async () => {
    const fetchSpy = mockTokenx(Response.json({ message: 'Error occurred' }, { status: 500 }));

    await expect(client.exchangeToken('idporten-jwt', 'unittest-gcp:namespace:app-a')).rejects.toMatchObject({
      message: 'Failed to exchange token',
      http_response_body: { message: 'Error occurred' },
    });

    expectExchangeRequest(fetchSpy);
  });
});
