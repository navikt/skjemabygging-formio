import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { azureTokenClient, AzureTokenRequest } from './azureTokenClient';

interface AzureTokenService {
  getAccessToken: () => Promise<string>;
}

const createAzureTokenService = ({
  tokenEndpoint,
  clientId,
  clientSecret,
  scope,
  devToken,
  client = azureTokenClient,
}: AzureTokenRequest & {
  devToken?: string;
  client?: Pick<typeof azureTokenClient, 'getAccessToken'>;
}): AzureTokenService => ({
  getAccessToken: async () => {
    if (devToken) return devToken;

    try {
      if (!clientId || !clientSecret) throw new Error('Missing credentials');
      const result = await client.getAccessToken({ tokenEndpoint, clientId, clientSecret, scope });
      if (typeof result?.access_token !== 'string' || !result.access_token.trim()) {
        throw new Error('Invalid token response');
      }
      return result.access_token;
    } catch (error) {
      throw new ResponseError(
        'SERVICE_UNAVAILABLE',
        'Unable to authenticate cover page request',
        error instanceof ResponseError ? error.correlationId : undefined,
      );
    }
  },
});

export { createAzureTokenService };
export type { AzureTokenService };
