import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import { config } from '../config';
import { logger } from '../logger';

type TokenIntrospectionResponse = {
  active?: boolean;
};

type CreateEntraIdHandlerOptions = {
  fetchImpl?: typeof fetch;
  introspectionEndpoint?: string;
  isBypassed?: boolean;
};

const introspectBearerToken = async (
  token: string,
  {
    fetchImpl,
    introspectionEndpoint,
  }: Required<Pick<CreateEntraIdHandlerOptions, 'fetchImpl' | 'introspectionEndpoint'>>,
) => {
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

const createEntraIdHandler = ({
  fetchImpl = fetch,
  introspectionEndpoint = config.entraId.introspectionEndpoint,
  isBypassed = config.isDevelopment || config.isTest,
}: CreateEntraIdHandlerOptions = {}): RequestHandler => {
  return async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
    const requestContext = {
      method: req.method,
      path: req.path,
    };

    if (isBypassed) {
      logger.debug('Skipping Entra ID auth check', requestContext);
      next();
      return;
    }

    if (!introspectionEndpoint) {
      logger.warn('Missing Entra ID introspection endpoint configuration', requestContext);
      next(new ResponseError('INTERNAL_SERVER_ERROR', 'Missing Entra ID introspection endpoint configuration'));
      return;
    }

    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Rejecting request without bearer token', requestContext);
      next(new ResponseError('UNAUTHORIZED', 'Missing bearer token'));
      return;
    }

    try {
      logger.debug('Validating Entra ID bearer token', requestContext);
      await introspectBearerToken(authHeader.replace('Bearer ', '').trim(), {
        fetchImpl,
        introspectionEndpoint,
      });
      logger.info('Accepted request with active Entra ID bearer token', requestContext);
      next();
    } catch (error: any) {
      if (error instanceof ResponseError) {
        logger.warn('Rejecting request during Entra ID auth validation', {
          ...requestContext,
          errorCode: error.errorCode,
          message: error.message,
        });
      } else {
        logger.warn('Unexpected error during Entra ID auth validation', {
          ...requestContext,
          message: error.message,
        });
      }
      next(error);
    }
  };
};

const entraIdHandler = createEntraIdHandler();

export { createEntraIdHandler };
export default entraIdHandler;
