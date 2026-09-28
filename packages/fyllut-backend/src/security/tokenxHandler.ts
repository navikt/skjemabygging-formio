import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { config } from '../config/config';
import { logger } from '../logger';
import TokenXClient from './tokenxClient';

const { isDevelopment } = config;

const { instance: tokenx } = TokenXClient;

const tokenxHandler =
  (targetClientId: string, dev: { token?: string; skip?: boolean } = {}): RequestHandler =>
  async (req, _res, next) => {
    try {
      let tokenxAccessToken;
      if (isDevelopment) {
        logger.debug('Mocking TokenX access token');
        tokenxAccessToken = dev.token ?? 'mocked-tokenx-access-token';
      } else if (typeof req.getIdportenJwt !== 'function') {
        throw new ResponseError('UNAUTHORIZED', 'ID-porten authentication is required');
      } else {
        tokenxAccessToken = await tokenx.exchangeToken(req.getIdportenJwt(), targetClientId);
      }
      req.getTokenxAccessToken = () => tokenxAccessToken;
    } catch (err) {
      return next(err);
    }
    next();
  };

export default tokenxHandler;
