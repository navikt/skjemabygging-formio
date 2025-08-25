import { config } from '../config/config';
import { logger } from '../logger.js';
import TokenXClient from './tokenxClient.js';

const { isDevelopment } = config;

const { instance: tokenx } = TokenXClient;

const tokenxHandler =
  (targetClientId: string, dev: { token?: string; skip?: boolean } = {}) =>
  async (req, res, next) => {
    try {
      let tokenxAccessToken;
      if (isDevelopment) {
        logger.debug('Mocking TokenX access token');
        tokenxAccessToken = dev.token ?? 'mocked-tokenx-access-token';
      } else if (typeof req.getIdportenJwt !== 'function') {
        throw Error('No Authorization header set, so user is not logged in. Cant get idporten jwt.');
      } else {
        tokenxAccessToken = await tokenx.exchangeToken(req.getIdportenJwt(), targetClientId);
      }
      req.getTokenxAccessToken = () => tokenxAccessToken;
    } catch (err) {
      next(err);
    }
    next();
  };

export default tokenxHandler;
