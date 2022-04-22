import correlator from "express-correlation-id";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { toJsonOrThrowError } from "../../utils/errorHandling.js";

const { skjemabyggingProxyUrl } = config;

const enhetsliste = {
  get: (req, res, next) => {
    fetch(`${skjemabyggingProxyUrl}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
      headers: {
        Authorization: `Bearer ${req.headers.AzureAccessToken}`,
        "x-correlation-id": correlator.getId(),
      },
    })
      .then(toJsonOrThrowError("Feil ved henting av enhetsliste", true))
      .then((enhetsliste) => res.send(enhetsliste))
      .catch((error) => {
        next(error);
      });
  },
};

export default enhetsliste;
