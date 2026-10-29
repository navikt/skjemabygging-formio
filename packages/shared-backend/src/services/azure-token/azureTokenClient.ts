import http from '../../shared/http/http';

interface AzureTokenRequest {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

const getAccessToken = ({ tokenEndpoint, clientId, clientSecret, scope }: AzureTokenRequest) =>
  http.post<{ access_token?: unknown }>(
    tokenEndpoint,
    new URLSearchParams({
      grant_type: 'client_credentials',
      scope,
      client_id: clientId,
      client_secret: clientSecret,
    }),
    { contentType: 'application/x-www-form-urlencoded', signal: AbortSignal.timeout(5000) },
  );

const azureTokenClient = { getAccessToken };

export { azureTokenClient };
export type { AzureTokenRequest };
