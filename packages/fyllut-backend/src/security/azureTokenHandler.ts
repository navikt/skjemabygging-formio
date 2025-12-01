import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import qs from 'qs';
import { config } from '../config/config';
import { logger } from '../logger';
import { toJsonOrThrowError } from '../utils/errorHandling';

const { clientId, clientSecret, azureOpenidTokenEndpoint, isDevelopment } = config;

const azureTokenHandler =
  (scope: string, headerName = 'AzureAccessToken', dev: { token?: string; skip?: boolean } = {}) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (isDevelopment) {
      if (dev.token) {
        req.headers[headerName] = dev.token;
        logger.info('Using pre-generated access token to fetch');
        return next();
      } else if (dev.skip) {
        logger.info(`Skipping Azure access token fetch (scope='${scope}', header='${headerName}')`);
        return next();
      }
    }

    try {
      const response = await fetch(azureOpenidTokenEndpoint!, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        body: qs.stringify({
          grant_type: 'client_credentials',
          scope: `openid api://${scope}/.default`,
          client_id: clientId,
          client_secret: clientSecret,
          client_auth_method: 'client_secret_basic',
        }),
      });

      const json: { access_token: string } = await toJsonOrThrowError('Feil ved autentisering')(response);
      req.headers[headerName] = json.access_token;
      next();
    } catch (error: any) {
      const errorMessage = error.http_response_body
        ? `Access token for ${scope} failed with: ${JSON.stringify(error.http_response_body)}`
        : `Access token for ${scope} failed with: ${JSON.stringify(error)}`;
      logger.error(errorMessage);
      next(error);
    }
  };

export default azureTokenHandler;
