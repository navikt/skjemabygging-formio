import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction, RequestHandler } from 'express';
import { config } from '../config';
import { logger } from '../logger';
import { introspectBearerToken } from './tokenIntrospection';

type CreateEntraIdM2mHandlerOptions = {
  fetchImpl?: typeof fetch;
  introspectionEndpoint?: string;
  isBypassed?: boolean;
};

const createEntraIdM2mHandler = ({
  fetchImpl = fetch,
  introspectionEndpoint = config.entraId.introspectionEndpoint,
  isBypassed = config.isDevelopment || config.isTest,
}: CreateEntraIdM2mHandlerOptions = {}): RequestHandler => {
  return async (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => {
    const requestContext = {
      method: req.method,
      path: req.path,
    };

    if (isBypassed) {
      logger.debug('Skipping Entra ID M2M auth check', requestContext);
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
      logger.warn('Rejecting request without bearer token (M2M)', requestContext);
      next(new ResponseError('UNAUTHORIZED', 'Missing bearer token'));
      return;
    }

    try {
      logger.debug('Validating Entra ID M2M bearer token', requestContext);
      await introspectBearerToken(authHeader.replace('Bearer ', '').trim(), {
        fetchImpl,
        introspectionEndpoint,
      });
      logger.info('Accepted request with active Entra ID M2M bearer token', requestContext);
      next();
    } catch (error: any) {
      if (error instanceof ResponseError) {
        logger.warn('Rejecting request during Entra ID M2M auth validation', {
          ...requestContext,
          errorCode: error.errorCode,
          message: error.message,
        });
      } else {
        logger.warn('Unexpected error during Entra ID M2M auth validation', {
          ...requestContext,
          message: error.message,
        });
      }
      next(error);
    }
  };
};

const entraIdM2mHandler = createEntraIdM2mHandler();

export { createEntraIdM2mHandler };
export default entraIdM2mHandler;
