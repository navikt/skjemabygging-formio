import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

type TexasIdentityProvider = 'entra_id' | 'idporten' | 'tokenx';

type TexasIntrospectionResponse = {
  active?: boolean;
  [claim: string]: unknown;
};

type TexasTokenResponse = {
  access_token?: string;
};

interface TexasRequestOptions {
  endpoint: string;
  fetchImpl?: typeof fetch;
}

interface IntrospectProps extends TexasRequestOptions {
  identityProvider: TexasIdentityProvider;
  token: string;
}

interface ExchangeProps extends TexasRequestOptions {
  identityProvider: TexasIdentityProvider;
  target: string;
  userToken: string;
}

const postForm = async <T>(
  { endpoint, fetchImpl = fetch }: TexasRequestOptions,
  body: Record<string, string>,
  messages: { unavailable: string; invalidResponse: string },
): Promise<T> => {
  let response: Response;

  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
    });
  } catch {
    throw new ResponseError('SERVICE_UNAVAILABLE', messages.unavailable);
  }

  if (!response.ok) {
    throw new ResponseError('SERVICE_UNAVAILABLE', messages.unavailable);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ResponseError('INTERNAL_SERVER_ERROR', messages.invalidResponse);
  }
};

// Texas validates signature and standard claims. Callers must validate other claims such as acr.
const introspect = ({ identityProvider, token, ...options }: IntrospectProps) =>
  postForm<TexasIntrospectionResponse>(
    options,
    { identity_provider: identityProvider, token },
    {
      unavailable: 'Unable to introspect bearer token',
      invalidResponse: 'Unable to parse token introspection response',
    },
  );

const exchange = async ({ identityProvider, target, userToken, ...options }: ExchangeProps): Promise<string> => {
  const response = await postForm<TexasTokenResponse>(
    options,
    { identity_provider: identityProvider, target, user_token: userToken },
    { unavailable: 'Unable to exchange token', invalidResponse: 'Unable to parse token exchange response' },
  );

  if (!response.access_token) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Token exchange response is missing access token');
  }

  return response.access_token;
};

const texasClient = {
  introspect,
  exchange,
};

export default texasClient;
export type { TexasIdentityProvider, TexasIntrospectionResponse };
