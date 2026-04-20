import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';

type TokenIntrospectionResponse = {
  active?: boolean;
};

type IntrospectionOptions = {
  fetchImpl: typeof fetch;
  introspectionEndpoint: string;
};

const introspectBearerToken = async (token: string, { fetchImpl, introspectionEndpoint }: IntrospectionOptions) => {
  let response: Response;

  try {
    response = await fetchImpl(introspectionEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        identity_provider: 'entra_id',
        token,
      }),
    });
  } catch {
    throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to introspect bearer token');
  }

  if (!response.ok) {
    throw new ResponseError('SERVICE_UNAVAILABLE', 'Unable to introspect bearer token');
  }

  let payload: TokenIntrospectionResponse;

  try {
    payload = (await response.json()) as TokenIntrospectionResponse;
  } catch {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Unable to parse token introspection response');
  }

  if (payload.active !== true) {
    throw new ResponseError('UNAUTHORIZED', 'Invalid bearer token');
  }
};

export { introspectBearerToken };
export type { IntrospectionOptions };
