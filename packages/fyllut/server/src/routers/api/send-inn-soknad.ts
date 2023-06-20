import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling";
import {
  assembleSendInnSoknadBody,
  isMellomLagringEnabled,
  sanitizeInnsendingsId,
  validateInnsendingsId,
} from "./helpers/sendInn";

const { featureToggles, sendInnConfig } = config;
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const sendInnSoknad = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const body = assembleSendInnSoknadBody(req.body, idportenPid, objectToByteArray({}));

      if (!isMellomLagringEnabled(featureToggles)) {
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
        res.sendStatus(201);
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

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const body = assembleSendInnSoknadBody(req.body, idportenPid, []);

      if (!isMellomLagringEnabled(featureToggles)) {
        res.json(body);
        return;
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

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
