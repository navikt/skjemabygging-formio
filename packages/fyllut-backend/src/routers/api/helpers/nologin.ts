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
  fnr: string,
  form: NavFormType,
  submission: Submission,
  language: string,
  submissionPdfAsByteArray: number[],
  translate: (text: string, textReplacements?: I18nTranslationMap) => string,
): SendInnSoknadBodyV2 => {
  const allAttachments: Component[] = navFormUtils
    .flattenComponents(form.components)
    .filter((comp: Component) => comp.type === 'attachment');

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
        vedleggsnr: attachment.type === 'id' ? 'K2' : (component?.properties?.vedleggskode ?? 'Ukjent'),
        label: translate(component?.label ?? attachment.description ?? 'Ukjent label'),
        tittel: translate(attachment.description ?? 'Ukjent tittel'),
        opplastingsStatus: attachment.type === 'id' ? 'LastetOpp' : mapToStatus(attachment.value),
        mimetype: 'application/pdf',
        pakrevd: attachment.type !== 'other',
        filIdListe: attachment.files?.map((f) => f.fileId),
        fyllutId: attachment.navId,
        beskrivelse: attachment.description ? translate(attachment.description) : null,
        propertyNavn: component?.key || null,
      } as DokumentV2;
    }),
    visningsType: 'nologin',
  };
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
