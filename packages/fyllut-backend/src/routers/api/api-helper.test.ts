import nock from 'nock';
import qs from 'qs';
import { mockRequest, mockResponse } from '../../test/requestTestHelpers';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('../../logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../security/tokenxHandler', () => ({ default: vi.fn() }));
vi.mock('../../middleware/nologinTokenHandler', () => ({ default: vi.fn() }));

describe('cover-page proxy token', () => {
  const tokenEndpoint = 'https://azure.example.test';
  const developmentToken = 'synthetic-proxy-token';

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('AZURE_OPENID_CONFIG_TOKEN_ENDPOINT', `${tokenEndpoint}/token`);
    vi.stubEnv('AZURE_APP_CLIENT_ID', 'test-fyllut-client');
    vi.stubEnv('SKJEMABYGGING_PROXY_CLIENT_ID', 'test-proxy-client');
    vi.stubEnv('SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN', developmentToken);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    nock.cleanAll();
  });

  it('uses the supplied development token without a client secret or Azure request', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MOCKS_ENABLED', 'false');
    vi.stubEnv('AZURE_APP_CLIENT_SECRET', undefined);
    const azureRequest = nock(tokenEndpoint).post('/token').reply(200, { access_token: 'unexpected-token' });
    const { initApiConfig } = await import('./api-helper');
    const req = mockRequest({});
    const next = vi.fn();

    await initApiConfig().azureM2MSkjemabyggingProxy(req, mockResponse(), next);

    expect(req.headers.AzureAccessToken).toBe(developmentToken);
    expect(next).toHaveBeenCalledExactlyOnceWith();
    expect(azureRequest.isDone()).toBe(false);
  });

  it.each([
    { name: 'production', nodeEnv: 'production', mocks: 'false', token: developmentToken },
    { name: 'unit tests', nodeEnv: 'test', mocks: 'false', token: developmentToken },
    { name: 'mock development', nodeEnv: 'development', mocks: 'true', token: developmentToken },
    { name: 'development without an override', nodeEnv: 'development', mocks: 'false', token: undefined },
  ])('retains client credentials in $name', async ({ nodeEnv, mocks, token }) => {
    vi.stubEnv('NODE_ENV', nodeEnv);
    vi.stubEnv('MOCKS_ENABLED', mocks);
    vi.stubEnv('SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN', token);
    vi.stubEnv('AZURE_APP_CLIENT_SECRET', 'synthetic-client-secret');
    const { config } = await import('../../config/config');
    const azureRequest = nock(tokenEndpoint)
      .post(
        '/token',
        qs.stringify({
          grant_type: 'client_credentials',
          scope: `openid api://${config.skjemabyggingProxyClientId}/.default`,
          client_id: 'test-fyllut-client',
          client_secret: 'synthetic-client-secret',
          client_auth_method: 'client_secret_basic',
        }),
      )
      .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
      .reply(200, { access_token: 'client-credentials-token' });
    const { initApiConfig } = await import('./api-helper');
    const req = mockRequest({});
    const next = vi.fn();

    await initApiConfig().azureM2MSkjemabyggingProxy(req, mockResponse(), next);

    expect(config.coverPageProxyDevToken).toBeUndefined();
    expect(req.headers.AzureAccessToken).toBe('client-credentials-token');
    expect(next).toHaveBeenCalledExactlyOnceWith();
    expect(azureRequest.isDone()).toBe(true);
  });
});
