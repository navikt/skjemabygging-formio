import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import qs from 'qs';
import { config } from '../../../../../fyllut-backend/src/config/config';
import { logger } from '../../../../../fyllut-backend/src/logger';
import { toJsonOrThrowError } from '../../../../../fyllut-backend/src/utils/errorHandling';

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const azureOnBehalfOfTokenHandler = (scope: string) => async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.get('Authorization');
  try {
    const response = await fetch(azureOpenidTokenEndpoint, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: qs.stringify({
        assertion: accessToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        scope: `api://${scope}/.default`, //<cluster>.<namespace>.<other-api-app-name>
      }),
    });
    const json: { access_token: string } = await toJsonOrThrowError('Feil ved autentisering')(response);
    req.headers.AzureAccessToken = json.access_token;
    next();
  } catch (error: any) {
    if (error.http_response_body) {
      logger.error(`Access token failed with: ${JSON.stringify(error.http_response_body)}`);
    } else {
      logger.error(`Access token failed with: ${JSON.stringify(error)}`);
    }

    next(error);
  }
};

export default azureOnBehalfOfTokenHandler;
