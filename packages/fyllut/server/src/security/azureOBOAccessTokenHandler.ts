import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { logger } from "../logger";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const postData = {
  grant_type: "client_credentials",
  scope: `openid api://${clientId}/.default`,
  client_id: clientId,
  client_secret: clientSecret,
  client_auth_method: "client_secret_basic",
};

const azureAccessTokenHandler = async () => {
  const body = qs.stringify(postData);
  return fetch(azureOpenidTokenEndpoint!, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: body,
  })
    .then(toJsonOrThrowError("Feil ved autentisering"))
    .then((response) => {
      // @ts-ignore
      return response.access_token;
    })
    .catch((error) => {
      logger.error(`Status az: ${error.http_status} and error: ${JSON.stringify(error.http_response_body)}`);
    });
};

const azureOBOAccessTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = await azureAccessTokenHandler();
  logger.debug(`Token is: ${token}`);
  logger.debug(`Client id: ${clientId}`);
  logger.debug(req.getIdportenJwt());
  return fetch(azureOpenidTokenEndpoint!, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: qs.stringify({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: clientId,
      client_secret: clientSecret,
      assertion: token,
      scope: "api://dev-fss.pdl.pdl-api/.default",
      requested_token_use: "on_behalf_of",
    }),
  })
    .then(toJsonOrThrowError("Feil ved OBO autentisering"))
    .then((response) => {
      logger.debug(`Response: ${qs.stringify(response)}`);

      // @ts-ignore
      req.headers.AzureAccessToken = response.access_token;

      logger.debug(`OBO: ${req.headers.AzureAccessToken}`);
      next();
    })
    .catch((error) => {
      logger.error(`Status: ${error.http_status} and error: ${JSON.stringify(error.http_response_body)}`);
      next(error);
    });
};

export default azureOBOAccessTokenHandler;
