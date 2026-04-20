import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import { config } from '../config';
import { logger } from '../logger';
import { introspectBearerToken } from './tokenIntrospection';

type CreateEntraIdOboHandlerOptions = {
  fetchImpl?: typeof fetch;
  introspectionEndpoint?: string;
  isBypassed?: boolean;
};

const createEntraIdOboHandler = ({
  fetchImpl = fetch,
  introspectionEndpoint = config.entraId.introspectionEndpoint,
  isBypassed = config.isDevelopment || config.isTest,
}: CreateEntraIdOboHandlerOptions = {}): RequestHandler => {
  return async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
    const requestContext = {
      method: req.method,
      path: req.path,
    };

    if (isBypassed) {
      logger.debug('Skipping Entra ID OBO auth check', requestContext);
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
      logger.warn('Rejecting request without bearer token (OBO)', requestContext);
      next(new ResponseError('UNAUTHORIZED', 'Missing bearer token'));
      return;
    }

    try {
      logger.debug('Validating Entra ID OBO bearer token', requestContext);
      await introspectBearerToken(authHeader.replace('Bearer ', '').trim(), {
        fetchImpl,
        introspectionEndpoint,
      });
      logger.info('Accepted request with active Entra ID OBO bearer token', requestContext);
      next();
    } catch (error: any) {
      if (error instanceof ResponseError) {
        logger.warn('Rejecting request during Entra ID OBO auth validation', {
          ...requestContext,
          errorCode: error.errorCode,
          message: error.message,
        });
      } else {
        logger.warn('Unexpected error during Entra ID OBO auth validation', {
          ...requestContext,
          message: error.message,
        });
      }
      next(error);
    }
  };
};

const entraIdOboHandler = createEntraIdOboHandler();

export { createEntraIdOboHandler };
export default entraIdOboHandler;
