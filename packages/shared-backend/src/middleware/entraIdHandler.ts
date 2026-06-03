import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';

type EntraIdHandlerType = 'M2M' | 'OBO';

type EntraIdHandlerLogContext = Record<string, unknown>;

interface EntraIdHandlerLogger {
  debug: (message: string, context?: EntraIdHandlerLogContext) => void;
  info: (message: string, context?: EntraIdHandlerLogContext) => void;
  warn: (message: string, context?: EntraIdHandlerLogContext) => void;
}

type CreateEntraIdHandlerOptions = {
  fetchImpl?: typeof fetch;
  introspectionEndpoint?: string;
  isBypassed: boolean;
  logger: EntraIdHandlerLogger;
};

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

const createEntraIdHandler = (
  handlerType: EntraIdHandlerType,
  { fetchImpl = fetch, introspectionEndpoint, isBypassed, logger }: CreateEntraIdHandlerOptions,
): RequestHandler => {
  if (isBypassed) {
    return async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
      const requestContext = {
        method: req.method,
        path: req.path,
      };

      logger.debug(`Skipping Entra ID ${handlerType} auth check`, requestContext);
      next();
    };
  }

  if (!introspectionEndpoint) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Missing Entra ID introspection endpoint configuration');
  }

  return async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
    const requestContext = {
      method: req.method,
      path: req.path,
    };

    const authHeader = req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn(`Rejecting request without bearer token (${handlerType})`, requestContext);
      next(new ResponseError('UNAUTHORIZED', 'Missing bearer token'));
      return;
    }

    try {
      logger.debug(`Validating Entra ID ${handlerType} bearer token`, requestContext);
      await introspectBearerToken(authHeader.slice('Bearer '.length).trim(), {
        fetchImpl,
        introspectionEndpoint,
      });
      logger.info(`Accepted request with active Entra ID ${handlerType} bearer token`, requestContext);
      next();
    } catch (error: unknown) {
      if (error instanceof ResponseError) {
        logger.warn(`Rejecting request during Entra ID ${handlerType} auth validation`, {
          ...requestContext,
          errorCode: error.errorCode,
          message: error.message,
        });
      } else {
        logger.warn(`Unexpected error during Entra ID ${handlerType} auth validation`, {
          ...requestContext,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      next(error);
    }
  };
};

const createEntraIdM2mHandler = (options: CreateEntraIdHandlerOptions): RequestHandler =>
  createEntraIdHandler('M2M', options);

const createEntraIdOboHandler = (options: CreateEntraIdHandlerOptions): RequestHandler =>
  createEntraIdHandler('OBO', options);

export { createEntraIdM2mHandler, createEntraIdOboHandler };
export type { CreateEntraIdHandlerOptions, EntraIdHandlerLogger };
