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
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: clientId,
      client_secret: clientSecret,
      assertion: req.getIdportenJwt(),
      scope: "api:/dev-fss.pdl.pdl-api/.default",
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
      next(error);
    });
};

export default azureOBOAccessTokenHandler;
