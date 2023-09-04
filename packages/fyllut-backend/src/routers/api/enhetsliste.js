import { supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-domain";
import correlator from "express-correlation-id";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { toJsonOrThrowError } from "../../utils/errorHandling.js";

const { skjemabyggingProxyUrl } = config;

const isEnhetstypeSupported = (enhet) => enhet.enhetNr !== "0000" && supportedEnhetstyper.includes(enhet.type);
const pickRelevantProps = (enhet) => {
  const { enhetId, navn, enhetNr, type } = enhet;
  return { enhetId, navn, enhetNr, type };
};

const enhetsliste = {
  get: (req, res, next) => {
    return fetch(`${skjemabyggingProxyUrl}/norg2/api/v1/enhet?enhetStatusListe=AKTIV`, {
      headers: {
        Authorization: `Bearer ${req.headers.AzureAccessToken}`,
        "x-correlation-id": correlator.getId(),
      },
    })
      .then(toJsonOrThrowError("Feil ved henting av enhetsliste", true))
      .then((enhetsliste) => res.json(enhetsliste.filter(isEnhetstypeSupported).map(pickRelevantProps)))
      .catch((error) => {
        next(error);
      });
  },
};

export default enhetsliste;
