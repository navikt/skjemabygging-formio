import { NextFunction, Request, Response } from 'express';
import qs from 'qs';
import config from '../../../config';
import { fetchWithErrorHandling } from '../../../fetchUtils';
import { logger } from '../../../logging/logger';
import { UnauthorizedError } from './errors';

const { azure, isDevelopment } = config;

const azureOnBehalfOfTokenHandler =
  (scope: string, devToken?: string) => async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.get('Authorization')?.replace('Bearer ', '');

    if (isDevelopment) {
      if (devToken) {
        req.headers.AzureAccessToken = devToken;
        logger.info('Using pre-generated access token to fetch');
      } else {
        logger.info(`Skipping Azure access token fetch (scope='${scope}')`);
      }
      return next();
    }

    try {
      const response = await fetchWithErrorHandling(azure.openidTokenEndpoint, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        body: qs.stringify({
          assertion: accessToken,
          client_id: azure.clientId,
          client_secret: azure.clientSecret,
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          requested_token_use: 'on_behalf_of',
          scope: `api://${scope}/.default`,
        }),
      });
      req.headers.AzureAccessToken = (response.data as any).access_token;
      next();
    } catch (error: any) {
      if (error.http_response_body) {
        next(new UnauthorizedError(`Access token failed with: ${JSON.stringify(error.http_response_body)}`));
      } else {
        next(new UnauthorizedError(`Access token failed with: ${JSON.stringify(error)}`));
      }

      next(error);
    }
  };

export default azureOnBehalfOfTokenHandler;
