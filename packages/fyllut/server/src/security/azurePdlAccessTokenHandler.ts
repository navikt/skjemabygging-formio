import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { logger } from "../logger";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const azurePdlAccessTokenHandler = (req: Request, res: Response, next: NextFunction) => {
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
      // @ts-ignore
      req.headers.AzureAccessToken = response.access_token;
      next();
    })
    .catch((error) => {
      logger.error(`PDL access token failed with: ${JSON.stringify(error.http_response_body)}`);
      next(error);
    });
};

export default azurePdlAccessTokenHandler;
