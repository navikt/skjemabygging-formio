import {
  AttachmentSettingValues,
  Component,
  I18nTranslationMap,
  NavFormType,
  navFormUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import { DokumentV2, OpplastingsStatus, SendInnSoknadBodyV2 } from '../../../types/sendinn/sendinn';
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
  const fnr = extractFnr(submission);
  if (!fnr) {
    throw new Error(
      `Unable to extract FNR from nologin submission with innsendingId ${innsendingsId} (formPath=${form.path})`,
    );
  }
  return {
    innsendingsId,
    brukerDto: {
      idType: 'FNR',
      id: fnr,
    },
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
        label: translate(component?.label ?? attachment.title ?? 'Ukjent label'),
        tittel: translate(attachment.title ?? component?.properties?.vedleggstittel ?? 'Ukjent tittel'),
        opplastingsStatus: attachment.type === 'personal-id' ? 'LastetOpp' : mapToStatus(attachment.value),
        mimetype: 'application/pdf',
        pakrevd: attachment.type !== 'other',
        filIdListe: attachment.files?.map((f) => f.fileId),
        fyllutId: attachment.navId,
        beskrivelse: attachment.additionalDocumentation ? translate(attachment.additionalDocumentation) : null,
        propertyNavn: null,
      } as DokumentV2;
    }),
  };
};

const extractFnr = (submission: Submission): string | undefined => {
  const { data } = submission;
  if (data.dineOpplysninger?.identitet?.identitetsnummer) {
    return data.dineOpplysninger.identitet.identitetsnummer as string;
  }
  return data.fodselsnummerDNummerSoker as string;
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
