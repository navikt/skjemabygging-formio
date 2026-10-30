import { createAzureTokenService } from './azureTokenService';

describe('Azure token service', () => {
  const credentials = {
    tokenEndpoint: 'https://azure.example.com/token',
    clientId: 'test-client',
    clientSecret: 'test-credential',
    scope: 'openid api://test-proxy/.default',
  };

  it('uses a supplied development token without client credentials or an Azure token request', async () => {
    const client = { getAccessToken: vi.fn() };
    const service = createAzureTokenService({
      ...credentials,
      clientId: '',
      clientSecret: '',
      devToken: 'local-generator-token',
      client,
    });

    await expect(service.getAccessToken()).resolves.toBe('local-generator-token');
    expect(client.getAccessToken).not.toHaveBeenCalled();
  });

  it('requests a proxy token with the configured application credentials', async () => {
    const client = { getAccessToken: vi.fn().mockResolvedValue({ access_token: 'azure-generator-token' }) };
    const service = createAzureTokenService({ ...credentials, devToken: '', client });

    await expect(service.getAccessToken()).resolves.toBe('azure-generator-token');
    expect(client.getAccessToken).toHaveBeenCalledWith(credentials);
  });

  it.each(['clientId', 'clientSecret'])('fails explicitly when %s is missing', async (field) => {
    const client = { getAccessToken: vi.fn() };
    const service = createAzureTokenService({ ...credentials, [field]: '', client });

    await expect(service.getAccessToken()).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to authenticate cover page request',
    });
    expect(client.getAccessToken).not.toHaveBeenCalled();
  });
});
