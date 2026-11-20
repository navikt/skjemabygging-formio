import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import texasClient from '../texas/texasClient';

interface EntraIdTokenService {
  getAccessToken: () => Promise<string>;
}

const createEntraIdTokenService = ({
  tokenEndpoint,
  target,
  devToken,
  client = texasClient,
}: {
  tokenEndpoint: string;
  target: string;
  devToken?: string;
  client?: Pick<typeof texasClient, 'token'>;
}): EntraIdTokenService => ({
  getAccessToken: async () => {
    if (devToken) return devToken;

    try {
      return await client.token({ endpoint: tokenEndpoint, identityProvider: 'entra_id', target });
    } catch {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to get Entra ID token');
    }
  },
});

export { createEntraIdTokenService };
export type { EntraIdTokenService };
