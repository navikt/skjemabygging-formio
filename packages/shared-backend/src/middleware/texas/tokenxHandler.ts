import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import texasClient from '../../services/texas/texasClient';
import { type AuthHandlerLogger, getRequestLogContext } from '../authHandlerLogger';
import { getIdportenUser } from './idportenAuth';

const TOKENX_TOKENS_KEY = 'tokenxTokens';

interface CreateTokenxHandlerOptions {
  exchangeEndpoint: string;
  /** The target application, `<cluster>:<namespace>:<app>` */
  audience: string;
  logger: AuthHandlerLogger;
  fetchImpl?: typeof fetch;
}

type TokenxTokens = Record<string, string>;

/**
 * Creates middleware that exchanges the ID-porten token for a TokenX token for the audience.
 * Runs after requireIdporten. Read the token with getTokenxToken(res, audience).
 */
const createTokenxHandler = ({
  exchangeEndpoint,
  audience,
  logger,
  fetchImpl,
}: CreateTokenxHandlerOptions): RequestHandler => {
  if (!exchangeEndpoint) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Missing TokenX exchange endpoint configuration');
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = getIdportenUser(res);
      const accessToken = await texasClient.exchange({
        endpoint: exchangeEndpoint,
        fetchImpl,
        identityProvider: 'tokenx',
        target: audience,
        userToken: token,
      });

      const existingTokens = res.locals[TOKENX_TOKENS_KEY] as TokenxTokens | undefined;
      res.locals[TOKENX_TOKENS_KEY] = { ...existingTokens, [audience]: accessToken };
      next();
    } catch (error) {
      logger.warn('TokenX exchange failed', {
        ...getRequestLogContext(req),
        audience,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      next(error);
    }
  };
};

const getTokenxToken = (res: Response, audience: string): string => {
  const token = (res.locals[TOKENX_TOKENS_KEY] as TokenxTokens | undefined)?.[audience];
  if (!token) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', `TokenX middleware must run before reading token for ${audience}`);
  }
  return token;
};

export { createTokenxHandler, getTokenxToken };
export type { CreateTokenxHandlerOptions };
