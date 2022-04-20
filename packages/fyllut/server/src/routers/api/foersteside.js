import correlator from "express-correlation-id";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { responseToError } from "../../utils/errorHandling.js";

const { skjemabyggingProxyUrl } = config;

const foersteside = {
  post: (req, res, next) => {
    const foerstesideData = JSON.stringify(req.body);
    fetch(`${skjemabyggingProxyUrl}/foersteside`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${req.headers.AzureAccessToken}`,
        "x-correlation-id": correlator.getId(),
      },
      body: foerstesideData,
    })
      .then(async (response) => {
        if (response.ok) {
          const body = await response.text();
          res.contentType("application/json");
          res.send(body);
        } else {
          next(await responseToError(response, "Feil ved generering av førsteside", true));
        }
      })
      .catch((error) => {
        next(error);
      });
  },
};

export default foersteside;
