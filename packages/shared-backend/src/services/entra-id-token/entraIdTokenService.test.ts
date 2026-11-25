import { createEntraIdTokenService } from './entraIdTokenService';

describe('Entra ID token service', () => {
  const options = { tokenEndpoint: 'http://texas/token', target: 'api://test-proxy/.default' };

  it('uses a supplied development token without a Texas token request', async () => {
    const client = { token: vi.fn() };
    const service = createEntraIdTokenService({ ...options, devToken: 'local-generator-token', client });

    await expect(service.getAccessToken()).resolves.toBe('local-generator-token');
    expect(client.token).not.toHaveBeenCalled();
  });

  it('requests a machine-to-machine token for the target from Texas', async () => {
    const client = { token: vi.fn().mockResolvedValue('texas-token') };
    const service = createEntraIdTokenService({ ...options, devToken: '', client });

    await expect(service.getAccessToken()).resolves.toBe('texas-token');
    expect(client.token).toHaveBeenCalledWith({
      endpoint: 'http://texas/token',
      identityProvider: 'entra_id',
      target: 'api://test-proxy/.default',
    });
  });

  it('reports a Texas failure as an unavailable service', async () => {
    const client = { token: vi.fn().mockRejectedValue(new Error('Token response is missing access token')) };
    const service = createEntraIdTokenService({ ...options, client });

    await expect(service.getAccessToken()).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'Unable to get Entra ID token',
    });
  });
});
