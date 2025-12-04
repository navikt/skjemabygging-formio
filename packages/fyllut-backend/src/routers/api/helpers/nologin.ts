import {
  AttachmentSettingValues,
  Component,
  I18nTranslationMap,
  NavFormType,
  navFormUtils,
  Submission,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  AvsenderId,
  BrukerDto,
  DokumentV2,
  OpplastingsStatus,
  SendInnSoknadBodyV2,
} from '../../../types/sendinn/sendinn';
import { base64EncodeByteArray } from '../../../utils/base64';
import { objectToByteArray } from './sendInn';

const assembleNologinSoknadBody = (
  innsendingsId: string,
  form: NavFormType,
  submission: Submission,
  language: string,
  submissionPdfAsByteArray: number[],
  translate: (text: string, textReplacements?: I18nTranslationMap) => string,
): SendInnSoknadBodyV2 => {
  const allAttachments: Component[] = navFormUtils
    .flattenComponents(form.components)
    .filter((comp: Component) => comp.type === 'attachment');
  const bruker = extractBruker(form, submission);
  const avsender = extractAvsender(submission);
  if (!bruker && !avsender) {
    throw new Error(`${innsendingsId}: Could not find user nor sender from nologin submission (formPath=${form.path})`);
  }
  return {
    innsendingsId,
    ...(bruker && { brukerDto: bruker }),
    ...(avsender && { avsenderId: avsender }),
    skjemanr: form.properties.skjemanummer,
    tittel: translate(form.title),
    tema: form.properties.tema,
    spraak: language,
    hoveddokument: {
      vedleggsnr: form.properties.skjemanummer,
      tittel: translate(form.title),
      pakrevd: true,
      opplastingsStatus: 'LastetOpp',
      mimetype: 'application/pdf',
      document: base64EncodeByteArray(submissionPdfAsByteArray),
      label: translate(form.title),
      fyllutId: null,
      beskrivelse: null,
      propertyNavn: null,
    } as DokumentV2,
    hoveddokumentVariant: {
      vedleggsnr: form.properties.skjemanummer,
      tittel: translate(form.title),
      label: translate(form.title),
      pakrevd: true,
      opplastingsStatus: 'LastetOpp',
      mimetype: 'application/json',
      document: base64EncodeByteArray(
        objectToByteArray({
          language,
          data: submission,
        }),
      ),
      fyllutId: null,
      beskrivelse: null,
      propertyNavn: null,
    } as DokumentV2,
    vedleggsListe: submission.attachments?.map((attachment) => {
      const component = allAttachments.find((c) => c.navId === attachment.navId);
      return {
        vedleggsnr: attachment.type === 'personal-id' ? 'K2' : (component?.properties?.vedleggskode ?? 'Ukjent'),
        label: translate(attachment.title ?? component?.label ?? 'Ukjent label'),
        tittel: translate(component?.properties?.vedleggstittel ?? attachment.title ?? 'Ukjent tittel'),
        opplastingsStatus: attachment.type === 'personal-id' ? 'LastetOpp' : mapToStatus(attachment.value),
        mimetype: 'application/pdf',
        pakrevd: attachment.type !== 'other',
        filIdListe: attachment.files?.map((f) => f.fileId),
        fyllutId: attachment.attachmentId,
        beskrivelse: component?.description ? translate(component?.description) : null,
        propertyNavn: null,
      } as DokumentV2;
    }),
  };
};

const extractBruker = (form: NavFormType, submission: Submission): BrukerDto | undefined => {
  const identityNumber = yourInformationUtils.getIdentityNumber(form, submission);
  if (identityNumber) {
    return { id: identityNumber, idType: 'FNR' };
  }
  return undefined;
};

const extractAvsender = (submission: Submission): AvsenderId | undefined => {
  const avsenderFornavn = submission.data.fornavnAvsender;
  const avsenderEtternavn = submission.data.etternavnAvsender;
  if (avsenderFornavn && avsenderEtternavn) {
    return { navn: `${avsenderFornavn} ${avsenderEtternavn}` };
  }
  return undefined;
};

function mapToStatus(value?: keyof AttachmentSettingValues): OpplastingsStatus {
  if (!value) {
    return 'IkkeValgt';
  }
  switch (value) {
    case 'leggerVedNaa':
      return 'LastetOpp';
    case 'nei':
      return 'SendesIkke';
    case 'ettersender':
      return 'SendSenere';
    case 'andre':
      return 'SendesAvAndre';
    case 'harIkke':
      return 'HarIkkeDokumentasjonen';
    case 'levertTidligere':
      return 'LevertDokumentasjonTidligere';
    case 'nav':
      return 'NavKanHenteDokumentasjon';
    default:
      return 'IkkeValgt';
  }
}

export { assembleNologinSoknadBody };
