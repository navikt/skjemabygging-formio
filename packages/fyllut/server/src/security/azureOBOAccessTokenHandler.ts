import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { logger } from "../logger";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const azureOBOAccessTokenHandler = (req: Request, res: Response, next: NextFunction) => {
  logger.debug(`Client id: ${clientId}`);
  logger.debug(req.getIdportenJwt());
  return fetch(azureOpenidTokenEndpoint!, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: qs.stringify({
      grant_type: "client_credentials",
      scope: `openid api://dev-fss.pdl.pdl-api/.default`,
      client_id: clientId,
      client_secret: clientSecret,
      client_auth_method: "client_secret_basic",
    }),
  })
    .then(toJsonOrThrowError("Feil ved PDL autentisering"))
    .then((response) => {
      logger.debug(`Response: ${qs.stringify(response)}`);

      // @ts-ignore
      req.headers.AzureAccessToken = response.access_token;

      logger.debug(`PDL token: ${req.headers.AzureAccessToken}`);
      next();
    })
    .catch((error) => {
      logger.error(`Status: ${error.http_status} and error: ${JSON.stringify(error.http_response_body)}`);
      next(error);
    });
};

export default azureOBOAccessTokenHandler;
