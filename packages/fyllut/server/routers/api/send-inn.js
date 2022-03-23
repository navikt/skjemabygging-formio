import fetch from "node-fetch";
import { config } from "../../config/config.js";
import { Pdfgen } from "../../pdfgen.js";
import { responseToError } from "../../utils/errorHandling.js";

const { featureToggles, gitVersion, sendInnHost } = config;

const getIdportenPid = (req) => {
  const idportenPid = req.getIdportenPid ? req.getIdportenPid() : null;
  if (!idportenPid) {
    throw new Error("Missing idporten pid");
  }
  return idportenPid;
};

const getTokenxAccessToken = (req) => {
  const tokenxAccessToken = req.getTokenxAccessToken ? req.getTokenxAccessToken() : null;
  if (!tokenxAccessToken) {
    throw new Error("Missing TokenX access token");
  }
  return tokenxAccessToken;
};

const sendInn = {
  post: async (req, res, next) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const { form, submission, attachments, language, translations = {} } = req.body;
      const pdfBase64 = await Pdfgen.generatePdfBase64(submission, form, gitVersion, translations);
      const body = {
        brukerId: idportenPid,
        skjemanr: form.properties.skjemanummer,
        tittel: form.title,
        tema: form.properties.tema,
        spraak: language || "nb-NO",
        hoveddokument: {
          tittel: form.title,
          mimetype: "application/pdf",
          pakrevd: true,
          document: [`data:application/pdf;base64,${pdfBase64}`],
        },
        hoveddokumentVariant: {
          tittel: form.title,
          mimetype: "application/json",
          pakrevd: false,
          document: [submission],
        },
        vedleggsListe: attachments,
      };
      if (!featureToggles.enableSendInnIntegration) {
        res.json(body);
        return;
      }
      const sendInnResponse = await fetch(`${sendInnHost}/fyllUt/leggTilVedlegg`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (sendInnResponse.ok || sendInnResponse.status === 302) {
        res.header({
          "Access-Control-Expose-Headers": "Location",
          Location: sendInnResponse.headers.get("location"),
        });
        res.sendStatus(201);
      } else {
        next(await responseToError(sendInnResponse, "Feil ved kall til SendInn", true));
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInn;
