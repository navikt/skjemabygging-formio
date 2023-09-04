import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { logger } from "../logger";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const azureAccessTokenHandler = (scope: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const response = await fetch(azureOpenidTokenEndpoint!, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: qs.stringify({
        grant_type: "client_credentials",
        scope: `openid api://${scope}/.default`,
        client_id: clientId,
        client_secret: clientSecret,
        client_auth_method: "client_secret_basic",
      }),
    });
    const json: { access_token: string } = await toJsonOrThrowError("Feil ved autentisering")(response);
    req.headers.AzureAccessToken = json.access_token;
    next();
  } catch (error: any) {
    logger.error(`Access token failed with: ${JSON.stringify(error.http_response_body)}`);
    next(error);
  }
};

export default azureAccessTokenHandler;
