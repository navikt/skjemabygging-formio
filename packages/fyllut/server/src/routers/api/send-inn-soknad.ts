import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { NextFunction, Request, Response } from "express";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { logger } from "../../logger";
import { getIdportenPid, getTokenxAccessToken } from "../../security/tokenHelper";
import { responseToError } from "../../utils/errorHandling";

/** TODO:
 * - formioID på vedlegg
 * - innsendingsId in url queryParam? (not needed until Get)
 * - initiell post
 *    - fiks hovedDokument
 * - put underveis (uten vedleggsliste)
 * - put submit (med vedleggsliste og pdf)
 * - only digital
 * - featureToggle (sett opp med true/false i fyllut)
 * - README
 * - Update types (frontend & backend)
 *    - language
 * - logging send-inn-soknad (feature toggle or missing innsendingsid)
 */

const DEFAULT_LANGUAGE = "nb-NO";
const { featureToggles, sendInnConfig } = config;
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

interface HovedDokument {
  vedleggsnr: string;
  label: string;
  tittel: string;
  mimetype: "application/json" | "application/pdf";
  pakrevd: boolean;
  document: number[];
}

//TODO
interface Attachment {
  formioId: string;
  label: string;
  beskrivelse: string;
  tittel: string;
}

interface SendInnSoknadBody {
  brukerId: string;
  skjemanr: string;
  tittel: string;
  tema: string;
  spraak: string;
  hoveddokument: HovedDokument;
  hoveddokumentVariant: HovedDokument;
  fristForEttersendelse?: number;
  vedleggsListe?: Attachment[];
  kanLasteOppAnnet?: boolean;
}

const sendInnSoknad = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const body = assembleSendInnSoknadBody(req.body, idportenPid, objectToByteArray({}));
      console.log("POST body", body);

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

      const sendInnResponse = await fetch(`${sendInnConfig!.host}${sendInnConfig!.paths.soknad}`, {
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
  put: async (req: Request, res: Response, next: NextFunction) => {
    const idportenPid = getIdportenPid(req);
    const tokenxAccessToken = getTokenxAccessToken(req);

    const body = assembleSendInnSoknadBody(req.body, idportenPid, []);
    const { innsendingsId } = req.body;

    const sendInnResponse = await fetch(`${sendInnConfig!.host}${sendInnConfig!.paths.soknad}/${innsendingsId}`, {
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

const assembleSendInnSoknadBody = (
  requestBody: {
    form: NavFormType;
    submission: Submission;
    language: string;
    translations?: Record<string, string>;
    attachments?: Attachment[];
    otherDocumentation?: boolean;
  },
  idportenPid: string,
  submissionPdfAsByteArray: number[] = []
): SendInnSoknadBody => {
  const { form, submission, language, translations = {}, attachments, otherDocumentation } = requestBody;
  const translate = (term: string) => translations[term] ?? term;

  const hoveddokument: HovedDokument = {
    vedleggsnr: form.properties.skjemanummer,
    label: translate(form.title),
    tittel: translate(form.title),
    mimetype: "application/pdf",
    pakrevd: true,
    document: submissionPdfAsByteArray,
  };

  const hoveddokumentVariant: HovedDokument = {
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

  let body: SendInnSoknadBody = {
    brukerId: idportenPid,
    skjemanr: form.properties.skjemanummer,
    tittel: translate(form.title),
    tema: form.properties.tema,
    spraak: language || DEFAULT_LANGUAGE,
    hoveddokument,
    hoveddokumentVariant,
  };

  if (!!form.properties.ettersendelsesfrist) {
    body.fristForEttersendelse = parseInt(form.properties.ettersendelsesfrist);
  }

  if (attachments) {
    body.vedleggsListe = attachments.map((attachment) => ({
      ...attachment,
      label: translate(attachment.label),
      beskrivelse: translate(attachment.beskrivelse),
      tittel: translate(attachment.tittel),
    }));
  }

  //TODO
  if (otherDocumentation !== undefined) {
    body.kanLasteOppAnnet = otherDocumentation;
  }

  return body;
};

export default sendInnSoknad;
