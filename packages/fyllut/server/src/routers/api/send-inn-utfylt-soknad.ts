import { localizationUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling";
import { createPdfAsByteArray } from "./helpers/pdfService";
import { assembleSendInnSoknadBody } from "./helpers/sendInn";

// const { featureToggles, sendInnConfig } = config;
const { sendInnConfig } = config;

const sendInnUtfyltSoknad = {
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);

      const { form, submission, submissionMethod, translation, language } = req.body;
      console.log("sendInnUtfyltSoknad", req.body);
      if (!req.headers.AzureAccessToken) {
        logger.error("Azure access token is missing. Unable to generate pdf");
      }
      const pdfByteArray = await createPdfAsByteArray(
        req.headers.AzureAccessToken as string,
        form,
        submission,
        submissionMethod,
        translation,
        localizationUtils.getLanguageCodeAsIso639_1(language)
      );

      const body = assembleSendInnSoknadBody(req.body, idportenPid, pdfByteArray);
      const { innsendingsId } = req.body;

      const sendInnResponse = await fetch(
        `${sendInnConfig!.host}${sendInnConfig!.paths.utfyltSoknad}/${innsendingsId}`,
        {
          method: "PUT",
          redirect: "manual",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      console.log(sendInnResponse);

      if (sendInnResponse.ok || sendInnResponse.status === 302) {
        const location = sendInnResponse.headers.get("location");
        logger.debug(`Successfylly posted data to SendInn (location: ${location})`);
        res.header({
          "Access-Control-Expose-Headers": "Location",
          Location: location,
        });
        res.sendStatus(201);
      } else {
        logger.debug("Failed to post data to SendInn");
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnUtfyltSoknad;
