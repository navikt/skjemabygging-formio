import {
  FeatureTogglesMap,
  I18nTranslationMap,
  NavFormType,
  Submission,
} from "@navikt/skjemadigitalisering-shared-domain";
import { logger } from "../../../logger";

interface HovedDokument {
  vedleggsnr: string;
  label: string;
  tittel: string;
  mimetype: "application/json" | "application/pdf";
  pakrevd: boolean;
  document: number[];
}

export interface Attachment {
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
}

export interface SendInnSoknadBody {
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

const DEFAULT_LANGUAGE = "nb-NO";
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const isValidUuid = (innsendingsId: string): boolean => {
  const validUuidExpr = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  return validUuidExpr.test(innsendingsId);
};

export const sanitizeInnsendingsId = (innsendingsId: string) => innsendingsId.replace(/[\./]/g, "");

export const validateInnsendingsId = (innsendingsId: string | undefined) => {
  let errorMessage;
  if (!innsendingsId) {
    errorMessage = "InnsendingsId mangler. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon";
  } else if (!isValidUuid(innsendingsId)) {
    errorMessage = `${innsendingsId} er ikke en gyldig innsendingsId. Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon`;
  }
  if (errorMessage) {
    logger.error(errorMessage);
  }
  return errorMessage;
};

export const isMellomLagringEnabled = (featureToggles: FeatureTogglesMap) => {
  if (!featureToggles?.enableMellomlagring) {
    logger.debug("Mellomlagring not enabled, returning data in body");
    return false;
  }

  if (!featureToggles?.enableSendInnIntegration) {
    logger.debug("SendInn integration not enabled, returning data in body");
    return false;
  }
  return true;
};

export const assembleSendInnSoknadBody = (
  requestBody: {
    form: NavFormType;
    submission: Submission;
    language: string;
    translation?: I18nTranslationMap;
    attachments?: Attachment[];
    otherDocumentation?: boolean | undefined;
  },
  idportenPid: string,
  submissionPdfAsByteArray: number[] = []
): SendInnSoknadBody => {
  const { form, submission, language, translation = {}, attachments, otherDocumentation } = requestBody;
  const translate = (term: string) => translation[term] ?? term;

  const hoveddokument: HovedDokument = {
    vedleggsnr: form.properties.skjemanummer,
    label: translate(form.title),
    tittel: translate(form.title),
    mimetype: "application/pdf",
    pakrevd: true,
    document: submissionPdfAsByteArray,
  };

  const hoveddokumentVariant: HovedDokument = {
    ...hoveddokument,
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

  if (otherDocumentation !== undefined) {
    body.kanLasteOppAnnet = otherDocumentation;
  }

  return body;
};
