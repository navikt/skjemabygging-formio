import { mockRequest, mockResponse } from '../../test/requestTestHelpers';

vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('../../logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../security/tokenxHandler', () => ({ default: vi.fn() }));
vi.mock('../../middleware/nologinTokenHandler', () => ({ default: vi.fn() }));

describe('initApiConfig', () => {
  const localToken = 'local-token';

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('MOCKS_ENABLED', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    {
      handler: 'azureM2MSkjemabyggingProxy',
      tokenVariable: 'SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN',
      header: 'AzureAccessToken',
    },
    {
      handler: 'azureMergePdfToken',
      tokenVariable: 'INNSENDING_API_M2M_ACCESS_TOKEN',
      header: 'MergePdfToken',
    },
  ] as const)('passes $tokenVariable to $handler', async ({ handler, tokenVariable, header }) => {
    vi.stubEnv(tokenVariable, localToken);
    const { initApiConfig } = await import('./api-helper');
    const req = mockRequest({});

    await initApiConfig()[handler](req, mockResponse(), vi.fn());

    expect(req.headers[header]).toBe(localToken);
  });
});
