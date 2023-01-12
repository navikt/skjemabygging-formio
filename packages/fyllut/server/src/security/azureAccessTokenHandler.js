import fetch from "node-fetch";
import qs from "qs";
import { config } from "../config/config";
import { toJsonOrThrowError } from "../utils/errorHandling.js";

const { skjemabyggingProxyClientId, clientId, clientSecret, azureOpenidTokenEndpoint } = config;

const postData = {
  grant_type: "client_credentials",
  scope: `openid api://${skjemabyggingProxyClientId}/.default`,
  client_id: clientId,
  client_secret: clientSecret,
  client_auth_method: "client_secret_basic",
};

const azureAccessTokenHandler = (req, res, next) => {
  const body = qs.stringify(postData);
  fetch(azureOpenidTokenEndpoint, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: body,
  })
    .then(toJsonOrThrowError("Feil ved autentisering"))
    .then(({ access_token }) => {
      req.headers.AzureAccessToken = access_token;
      next();
    })
    .catch((error) => {
      next(error);
    });
};

export default azureAccessTokenHandler;
