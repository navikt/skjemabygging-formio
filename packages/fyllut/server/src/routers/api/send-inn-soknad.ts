import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling";

/** TODO:
 * - formioID på vedlegg
 * - initiell post
 *    - fiks hovedDokument
 * - put underveis (uten vedleggsliste)
 * - put submit (med vedleggsliste og pdf)
 * - only digital
 */

const DEFAULT_LANGUAGE = "nb-NO";
const { featureToggles, sendInnConfig } = config;
const objectToByteArray = (obj) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const sendInnSoknad = {
  post: async (req, res, next) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);

      const { form, submission, language, translations = {} } = req.body;
      const translate = (term) => translations[term] ?? term;

      const hoveddokumentVariant = {
        vedleggsnr: form.properties.skjemanummer,
        label: translate(form.title),
        tittel: translate(form.title),
        mimetype: "application/json",
        pakrevd: false,
        document: objectToByteArray({
          language: language || DEFAULT_LANGUAGE,
          data: submission,
        }),
      };

      const body: SendInnSoknadBody = {
        brukerId: idportenPid,
        skjemanr: form.properties.skjemanummer,
        tittel: translate(form.title),
        tema: form.properties.tema,
        spraak: language || DEFAULT_LANGUAGE,
        hoveddokument: hoveddokumentVariant, //TODO: Avklar hvoeddokument i post og put
        hoveddokumentVariant,
      };

      if (!!form.properties.ettersendelsesfrist) {
        body.fristForEttersendelse = parseInt(form.properties.ettersendelsesfrist);
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
        res.send(await sendInnResponse.json());
      } else {
        logger.debug("Failed to post data to SendInn");
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
  put: async (req, res, next) => {
    const idportenPid = getIdportenPid(req);
    const tokenxAccessToken = getTokenxAccessToken(req);

    console.log(req.body);
    const { innsendingsId, form, submission, language, translations = {} } = req.body;
    const translate = (term) => translations[term] ?? term;

    const hoveddokumentVariant = {
      vedleggsnr: form.properties.skjemanummer,
      label: translate(form.title),
      tittel: translate(form.title),
      mimetype: "application/json",
      pakrevd: false,
      document: objectToByteArray({
        language: language || DEFAULT_LANGUAGE,
        data: submission,
      }),
    };

    const body = {
      brukerId: idportenPid,
      skjemanr: form.properties.skjemanummer,
      tittel: translate(form.title),
      tema: form.properties.tema,
      spraak: language || DEFAULT_LANGUAGE,
      hoveddokument: hoveddokumentVariant,
      hoveddokumentVariant,
    };

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
      res.send(sendInnResponse.json());
    } else {
      logger.debug("Failed to update data in SendInn");
      next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
    }
  },
};

export default sendInnSoknad;
