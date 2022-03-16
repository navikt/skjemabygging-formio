import fetch from "node-fetch";
import { config } from "../../config/config.js";
import { Pdfgen } from "../../pdfgen.js";
import { responseToError } from "../../utils/errorHandling.js";

const { gitVersion, sendInnHost } = config;

const sendInn = {
  post: async (req, res, next) => {
    try {
      const { form, submission, attachments, language, translations = {} } = req.body;
      const pdfBase64 = await Pdfgen.generatePdfBase64(submission, form, gitVersion, translations);
      const body = {
        brukerId: "string",
        skjemanr: form.properties.skjemanummer,
        tittel: form.title,
        tema: form.properties.tema,
        spraak: language || "nb-NO",
        hoveddokument: {
          vedleggsnr: "string",
          tittel: form.title,
          mimetype: "application/pdf",
          pakrevd: true,
          document: [pdfBase64],
        },
        hoveddokumentVariant: {
          vedleggsnr: "string",
          tittel: form.title,
          mimetype: "application/json",
          pakrevd: false,
          document: [submission],
        },
        vedleggsListe: attachments,
      };
      const sendInnResponse = await fetch(`${sendInnHost}/fyllUt/leggTilVedlegg`, {
        method: "POST",
        redirect: "manual",
        headers: {
          "Content-Type": "application/json",
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
