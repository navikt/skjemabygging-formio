import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { base64Decode } from "../../utils/base64";
import { responseToError } from "../../utils/errorHandling";
import {
  assembleSendInnSoknadBody,
  byteArrayToObject,
  isMellomLagringEnabled,
  sanitizeInnsendingsId,
  validateInnsendingsId,
} from "./helpers/sendInn";

const { featureToggles, sendInnConfig } = config;

const sendInnSoknad = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);

      if (!isMellomLagringEnabled(featureToggles)) {
        res.end();
        return;
      }

      const sanitizedInnsendingsId = sanitizeInnsendingsId(req.params.innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
        }
      );

      if (sendInnResponse.ok) {
        logger.debug("Successfylly fetched data from SendInn");
        const json = await sendInnResponse.json();
        const response = {
          ...json,
          hoveddokumentVariant: {
            ...json.hoveddokumentVariant,
            document: byteArrayToObject(base64Decode(json.hoveddokumentVariant.document)),
          },
        };
        console.log("GET json", json);
        res.json(response);
      } else {
        logger.debug("Failed to fetch data from SendInn");
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (error) {
      next(error);
    }
  },
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const body = assembleSendInnSoknadBody(req.body, idportenPid, null);

      if (!isMellomLagringEnabled(featureToggles)) {
        res.json(body);
        return;
      }

      const sendInnResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.soknad}?opprettNySoknad=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (sendInnResponse.ok) {
        logger.debug("Successfylly posted data to SendInn");
        res.status(201);
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

      const body = assembleSendInnSoknadBody(req.body, idportenPid, null);

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
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenxAccessToken = getTokenxAccessToken(req);

      const sanitizedInnsendingsId = sanitizeInnsendingsId(req.params.innsendingsId);
      const errorMessage = validateInnsendingsId(sanitizedInnsendingsId);
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      if (!isMellomLagringEnabled(featureToggles)) {
        res.status(501).end();
        return;
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.soknad}/${sanitizedInnsendingsId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
        }
      );

      if (sendInnResponse.ok) {
        logger.debug(`Successfylly deleted soknad with innsendingsId ${sanitizedInnsendingsId}`);
        res.json(await sendInnResponse.json());
      } else {
        logger.debug(`Failed to delete soknad with innsendingsId ${sanitizedInnsendingsId}`);
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnSoknad;
