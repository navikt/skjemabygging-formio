import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import texasClient from '../services/texas/texasClient';
import type { AuthHandlerLogger } from './authHandlerLogger';

type EntraIdHandlerType = 'M2M' | 'OBO';

type EntraIdHandlerLogger = AuthHandlerLogger;

type CreateEntraIdHandlerOptions = {
  fetchImpl?: typeof fetch;
  introspectionEndpoint?: string;
  isBypassed: boolean;
  logger: EntraIdHandlerLogger;
};

const introspectBearerToken = async (token: string, introspectionEndpoint: string, fetchImpl: typeof fetch) => {
  const payload = await texasClient.introspect({
    endpoint: introspectionEndpoint,
    fetchImpl,
    identityProvider: 'entra_id',
    token,
  });

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
      await introspectBearerToken(authHeader.slice('Bearer '.length).trim(), introspectionEndpoint, fetchImpl);
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
