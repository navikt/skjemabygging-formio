import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import texasClient from '../../services/texas/texasClient';
import type { AuthHandlerLogger } from '../authHandlerLogger';
import { getIdportenUser } from './idportenHandler';

const TOKENX_TOKENS_KEY = 'tokenxTokens';

interface CreateTokenxHandlerOptions {
  exchangeEndpoint: string;
  logger: AuthHandlerLogger;
  fetchImpl?: typeof fetch;
}

type TokenxTokens = Record<string, string>;

/**
 * Creates a factory for middleware that exchanges the ID-porten token for a TokenX token.
 * Runs after requireIdporten. Read the token with getTokenxToken(res, audience).
 *
 * @returns (audience) => middleware, where audience is `<cluster>:<namespace>:<app>`
 */
const createTokenxHandler = ({ exchangeEndpoint, logger, fetchImpl }: CreateTokenxHandlerOptions) => {
  if (!exchangeEndpoint) {
    throw new ResponseError('INTERNAL_SERVER_ERROR', 'Missing TokenX exchange endpoint configuration');
  }

  return (audience: string): RequestHandler =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = getIdportenUser(res);
        const accessToken = await texasClient.exchange({
          endpoint: exchangeEndpoint,
          fetchImpl,
          identityProvider: 'tokenx',
          target: audience,
          userToken: token,
        });
        res.locals[TOKENX_TOKENS_KEY] = { ...(res.locals[TOKENX_TOKENS_KEY] as TokenxTokens), [audience]: accessToken };
        next();
      } catch (error) {
        logger.warn('TokenX exchange failed', {
          method: req.method,
          path: req.path,
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
