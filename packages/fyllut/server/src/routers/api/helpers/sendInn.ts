import { I18nTranslationMap, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";

const DEFAULT_LANGUAGE = "nb-NO";
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

interface HovedDokument {
  vedleggsnr: string;
  label: string;
  tittel: string;
  mimetype: "application/json" | "application/pdf";
  pakrevd: boolean;
  document: number[];
}

interface Attachment {
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
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

export const assembleSendInnSoknadBody = (
  requestBody: {
    form: NavFormType;
    submission: Submission;
    language: string;
    translation?: I18nTranslationMap;
    attachments?: Attachment[];
    otherDocumentation?: boolean;
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
