import { mockRequest, mockResponse } from '../test/requestTestHelpers';

const localToken = 'local-token';
const fetchedToken = 'fetched-token';

const config = vi.hoisted(() => ({
  clientId: 'test-client',
  clientSecret: 'test-secret',
  azureOpenidTokenEndpoint: 'https://azure.example.test/token',
  isDevelopment: true,
  mocksEnabled: false,
}));

vi.mock('../config/config', () => ({ config }));
vi.mock('../logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));

const runHandler = async (devToken?: string) => {
  const { default: azureTokenHandler } = await import('./azureTokenHandler');
  const req = mockRequest({});
  const next = vi.fn();
  await azureTokenHandler('test-scope', 'AzureAccessToken', { token: devToken })(req, mockResponse(), next);
  return { req, next };
};

describe('azureTokenHandler', () => {
  beforeEach(() => {
    vi.resetModules();
    config.isDevelopment = true;
    config.mocksEnabled = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the local token in development without requesting Azure', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    const { req, next } = await runHandler(localToken);

    expect(req.headers.AzureAccessToken).toBe(localToken);
    expect(next).toHaveBeenCalledExactlyOnceWith();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'mocks are enabled', isDevelopment: true, mocksEnabled: true, devToken: localToken },
    { name: 'not in development', isDevelopment: false, mocksEnabled: false, devToken: localToken },
    { name: 'no local token is set', isDevelopment: true, mocksEnabled: false, devToken: undefined },
  ])('requests a token from Azure when $name', async ({ isDevelopment, mocksEnabled, devToken }) => {
    config.isDevelopment = isDevelopment;
    config.mocksEnabled = mocksEnabled;
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(Response.json({ access_token: fetchedToken }));

    const { req, next } = await runHandler(devToken);

    expect(req.headers.AzureAccessToken).toBe(fetchedToken);
    expect(next).toHaveBeenCalledExactlyOnceWith();
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(
      config.azureOpenidTokenEndpoint,
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
