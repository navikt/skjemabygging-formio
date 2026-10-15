import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import texasClient from '../../services/texas/texasClient';
import type { AuthHandlerLogger } from '../authHandlerLogger';

const ACCEPTED_ACR_VALUES = ['idporten-loa-high', 'Level4'];
const IDPORTEN_USER_KEY = 'idportenUser';

interface IdportenUser {
  pid: string;
  token: string;
}

interface CreateIdportenAuthOptions {
  introspectionEndpoint: string;
  logger: AuthHandlerLogger;
  fetchImpl?: typeof fetch;
}

interface IdportenAuth {
  /** Resolves the signed-in user, or undefined when the request has no valid session at the required level. */
  authenticate: (req: Request) => Promise<IdportenUser | undefined>;
  /** Stores the user in res.locals, or rejects the request with 401. */
  requireIdporten: RequestHandler;
}

const getBearerToken = (req: Request) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }
  return authHeader.slice('Bearer '.length).trim() || undefined;
};

const createIdportenAuth = ({ introspectionEndpoint, logger, fetchImpl }: CreateIdportenAuthOptions): IdportenAuth => {
  if (!introspectionEndpoint) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Missing ID-porten introspection endpoint configuration');
  }

  const authenticate = async (req: Request): Promise<IdportenUser | undefined> => {
    const requestContext = { method: req.method, path: req.path };
    const token = getBearerToken(req);
    if (!token) {
      logger.debug('No ID-porten bearer token on request', requestContext);
      return undefined;
    }

    const claims = await texasClient.introspect({
      endpoint: introspectionEndpoint,
      fetchImpl,
      identityProvider: 'idporten',
      token,
    });

    if (claims.active !== true) {
      logger.info('Inactive ID-porten token', requestContext);
      return undefined;
    }

    if (typeof claims.acr !== 'string' || !ACCEPTED_ACR_VALUES.includes(claims.acr)) {
      logger.info('ID-porten token has insufficient security level', { ...requestContext, acr: claims.acr });
      return undefined;
    }

    if (typeof claims.pid !== 'string' || !claims.pid) {
      logger.warn('ID-porten token is missing pid', requestContext);
      return undefined;
    }

    return { pid: claims.pid, token };
  };

  const requireIdporten = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authenticate(req);
      if (!user) {
        next(new ResponseError('UNAUTHORIZED', 'Missing or invalid ID-porten session'));
        return;
      }
      res.locals[IDPORTEN_USER_KEY] = user;
      next();
    } catch (error) {
      logger.warn('ID-porten authentication failed', {
        method: req.method,
        path: req.path,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };

  return { authenticate, requireIdporten };
};

const getIdportenUser = (res: Response): IdportenUser => {
  const user = res.locals[IDPORTEN_USER_KEY] as IdportenUser | undefined;
  if (!user) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'requireIdporten must run before reading the ID-porten user');
  }
  return user;
};

export { createIdportenAuth, getIdportenUser };
export type { CreateIdportenAuthOptions, IdportenAuth, IdportenUser };
