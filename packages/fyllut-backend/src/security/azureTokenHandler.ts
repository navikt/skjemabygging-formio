import { copyDependencyErrorFields, fetchFromDependency } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import qs from 'qs';
import { config } from '../config/config';
import { logger } from '../logger';
import { toJsonOrThrowError } from '../utils/errorHandling';

const { clientId, clientSecret, azureOpenidTokenEndpoint, isDevelopment, mocksEnabled } = config;

const azureTokenHandler =
  (scope: string, headerName = 'AzureAccessToken', dev: { token?: string; skip?: boolean } = {}) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (isDevelopment) {
      // Mock runs use the mock token endpoint, so tokens from a local .env are never sent to mocks
      if (dev.token && !mocksEnabled) {
        req.headers[headerName] = dev.token;
        logger.info('Using pre-generated access token to fetch');
        return next();
      } else if (dev.skip) {
        logger.info(`Skipping Azure access token fetch (scope='${scope}', header='${headerName}')`);
        return next();
      }
    }

    try {
      const response = await fetchFromDependency(azureOpenidTokenEndpoint!, {
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
        : `Access token for ${scope} failed with: ${error.message}${error.cause ? ` (${error.cause.code ?? error.cause.message})` : ''}`;

      if (error instanceof TypeError && error.message === 'fetch failed') {
        logger.warn(errorMessage);
        return next(
          copyDependencyErrorFields(
            error,
            new ResponseError('SERVICE_UNAVAILABLE', 'Could not get access token.', undefined, 'Det oppstod en feil'),
          ),
        );
      }

      logger.error(errorMessage);
      next(error);
    }
  };

export default azureTokenHandler;
