import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger.js";
import { Pdfgen } from "../../pdfgen.js";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling.js";

const { featureToggles, gitVersion, sendInnConfig } = config;

const objectToByteArray = (obj) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const sendInn = {
  post: async (req, res, next) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const isTest = req.get("Fyllut-Is-Test") === "true";
      const { form, submission, attachments, language, otherDocumentation, translations = {} } = req.body;
      const translate = (term) => translations[term] ?? term;
      const translatedAttachments = attachments.map((attachment) => ({
        ...attachment,
        label: translate(attachment.label),
        beskrivelse: translate(attachment.beskrivelse),
        tittel: translate(attachment.tittel),
      }));
      const pdfByteArray = await Pdfgen.generatePdfByteArray(submission, form, gitVersion, translations, isTest);
      const body = {
        brukerId: idportenPid,
        skjemanr: form.properties.skjemanummer,
        tittel: translate(form.title),
        tema: form.properties.tema,
        spraak: language || "nb-NO",
        hoveddokument: {
          vedleggsnr: form.properties.skjemanummer,
          label: translate(form.title),
          tittel: translate(form.title),
          mimetype: "application/pdf",
          pakrevd: true,
          document: pdfByteArray,
        },
        hoveddokumentVariant: {
          vedleggsnr: form.properties.skjemanummer,
          label: translate(form.title),
          tittel: translate(form.title),
          mimetype: "application/json",
          pakrevd: false,
          document: objectToByteArray(submission),
        },
        vedleggsListe: translatedAttachments,
        kanLasteOppAnnet: otherDocumentation,
      };
      if (!featureToggles.enableSendInnIntegration) {
        logger.debug("SendInn integration not enabled, returning data in body");
        res.json(body);
        return;
      }
      logger.debug("Posting data to SendInn");
      const sendInnResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.leggTilVedlegg}`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
        body: JSON.stringify(body),
      });
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

export default sendInn;
