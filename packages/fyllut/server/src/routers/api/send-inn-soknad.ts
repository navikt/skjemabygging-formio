import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling";
import { assembleSendInnSoknadBody, isValidUuid } from "./helpers/sendInn";

const { featureToggles, sendInnConfig } = config;
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const sendInnSoknad = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const body = assembleSendInnSoknadBody(req.body, idportenPid, objectToByteArray({}));

      if (!featureToggles.enableMellomlagring) {
        logger.debug("Mellomlagring not enabled, returning data in body");
        res.json(body);
        return;
      }

      if (!featureToggles.enableSendInnIntegration) {
        logger.debug("SendInn integration not enabled, returning data in body");
        res.json(body);
        return;
      }

      const sendInnResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.soknad}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (sendInnResponse.ok) {
        logger.debug("Successfylly posted data to SendInn");
        res.json(await sendInnResponse.json());
      } else {
        logger.debug("Failed to post data to SendInn");
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);

      const { innsendingsId } = req.body;

      if (!innsendingsId) {
        logger.error("InnsendingsId mangler. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon");
      } else if (!isValidUuid(innsendingsId)) {
        logger.error(
          `${innsendingsId} er ikke gyldig. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon`
        );
        return;
      }
      const body = assembleSendInnSoknadBody(req.body, idportenPid, []);

      const sendInnResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.soknad}/${innsendingsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (sendInnResponse.ok) {
        logger.debug("Successfylly updated data in SendInn");
        res.json(await sendInnResponse.json());
      } else {
        logger.debug("Failed to update data in SendInn");
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnSoknad;
