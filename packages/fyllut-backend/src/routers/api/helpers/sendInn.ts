import {
  I18nTranslationMap,
  NavFormType,
  Submission,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../../logger';
import { base64EncodeByteArray } from '../../../utils/base64';
import { HttpError } from '../../../utils/errors/HttpError';

interface HovedDokument {
  vedleggsnr: string;
  label: string;
  tittel: string;
  mimetype: 'application/json' | 'application/pdf';
  pakrevd: boolean;
  document: string | null;
}

interface Attachment {
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
  vedleggskjema?: string;
}

interface SendInnSoknadBody {
  brukerId: string;
  skjemanr: string;
  skjemapath: string;
  tittel: string;
  tema: string;
  spraak: string;
  hoveddokument: HovedDokument;
  hoveddokumentVariant: HovedDokument;
  fristForEttersendelse?: number;
  vedleggsListe?: Attachment[];
  kanLasteOppAnnet?: boolean;
  innsendingsId?: string;
  mellomlagringDager?: number;
}

const DEFAULT_LANGUAGE = 'nb-NO';
const objectToByteArray = (obj: object) => Array.from(new TextEncoder().encode(JSON.stringify(obj)));

const byteArrayToObject = (byteArray?: Buffer) => JSON.parse(new TextDecoder().decode(byteArray));

const sanitizeInnsendingsId = (innsendingsId: string) => {
  if (!innsendingsId) return innsendingsId;

  return innsendingsId.replace(/[./]/g, '');
};

const validateInnsendingsId = (innsendingsId: string | undefined, supplementaryMessage?: string) => {
  let errorMessage;
  if (!innsendingsId) {
    errorMessage = 'InnsendingsId mangler.';
  } else if (!validatorUtils.isValidUuid(innsendingsId)) {
    errorMessage = `${innsendingsId} er ikke en gyldig innsendingsId.`;
  }
  if (errorMessage && supplementaryMessage) {
    errorMessage = `${errorMessage} ${supplementaryMessage}`;
  }
  if (errorMessage) {
    logger.error(errorMessage);
  }
  return errorMessage;
};

const assembleSendInnSoknadBody = (
  requestBody: {
    form: NavFormType;
    submission: Submission;
    language: string;
    translation?: I18nTranslationMap;
    attachments?: Attachment[];
    otherDocumentation?: boolean | undefined;
    innsendingsId?: string;
  },
  idportenPid: string,
  fyllutUrl: string,
  submissionPdfAsByteArray: number[] | null = null,
): SendInnSoknadBody => {
  const { form, submission, language, translation = {}, attachments, otherDocumentation, innsendingsId } = requestBody;
  const translate = (term: string) => translation[term] ?? term;

  const dokumentMetaData = {
    vedleggsnr: form.properties.skjemanummer,
    label: translate(form.title),
    tittel: translate(form.title),
  };

  const hoveddokument: HovedDokument = {
    ...dokumentMetaData,
    mimetype: 'application/pdf',
    pakrevd: true,
    document: submissionPdfAsByteArray ? base64EncodeByteArray(submissionPdfAsByteArray) : null,
  };

  const hoveddokumentVariant: HovedDokument = {
    ...dokumentMetaData,
    mimetype: 'application/json',
    pakrevd: false,
    document: base64EncodeByteArray(
      objectToByteArray({
        language: language || DEFAULT_LANGUAGE,
        data: submission,
      }),
    ),
  };

  const body: SendInnSoknadBody = {
    brukerId: idportenPid,
    skjemanr: form.properties.skjemanummer,
    skjemapath: form.path,
    tittel: translate(form.title),
    tema: form.properties.tema,
    spraak: language || DEFAULT_LANGUAGE,
    hoveddokument,
    hoveddokumentVariant,
    innsendingsId,
  };

  if (form.properties.mellomlagringDurationDays) {
    body.mellomlagringDager = parseInt(form.properties.mellomlagringDurationDays);
  }

  if (form.properties.ettersendelsesfrist) {
    body.fristForEttersendelse = parseInt(form.properties.ettersendelsesfrist);
  }

  if (attachments) {
    body.vedleggsListe = attachments.map((attachment) => ({
      ...attachment,
      label: translate(attachment.label),
      beskrivelse: translate(attachment.beskrivelse),
      tittel: translate(attachment.tittel),
      ...(attachment.vedleggskjema && {
        vedleggsurl: `${fyllutUrl}/${attachment.vedleggskjema}?sub=paper`,
      }),
    }));
  }

  if (otherDocumentation !== undefined) {
    body.kanLasteOppAnnet = otherDocumentation;
  }

  return body;
};

const isNotFound = (response: { status: number }, responseError: HttpError | undefined) =>
  response.status === 404 ||
  responseError?.http_response_body?.errorCode === 'illegalAction.applicationSentInOrDeleted';

export {
  assembleSendInnSoknadBody,
  byteArrayToObject,
  isNotFound,
  objectToByteArray,
  sanitizeInnsendingsId,
  validateInnsendingsId,
};
export type { Attachment, SendInnSoknadBody };
