import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const postData = {
  grant_type: "client_credentials",
  scope: `api:/dev-fss.pdl.pdl-api/.default`,
  client_id: clientId,
  client_secret: clientSecret,
  client_auth_method: "client_secret_basic",
};

const azureOBOAccessTokenHandler = (req: Request, res: Response, next: NextFunction) => {
  const body = qs.stringify(postData);
  fetch(azureOpenidTokenEndpoint!, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: body,
  })
    .then(toJsonOrThrowError("Feil ved autentisering"))
    .then((response) => {
      // @ts-ignore
      req.headers.AzureAccessToken = response.access_token;
      next();
    })
    .catch((error) => {
      next(error);
    });
};

export default azureOBOAccessTokenHandler;
