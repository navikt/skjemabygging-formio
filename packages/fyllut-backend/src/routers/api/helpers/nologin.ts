import {
  AttachmentSettingValues,
  Component,
  I18nTranslationMap,
  NavFormType,
  navFormUtils,
  Submission,
  TranslationLang,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  Attachment,
  AvsenderId,
  BrukerDto,
  OpplastingsStatus,
  SubmitApplicationRequest,
} from '../../../types/sendinn/sendinn';
import { base64EncodeByteArray } from '../../../utils/base64';
import { objectToByteArray } from './sendInn';

const assembleNologinSoknadBody = (
  innsendingsId: string,
  form: NavFormType,
  submission: Submission,
  language: TranslationLang,
  submissionPdfAsByteArray: number[],
  translate: (text: string, textReplacements?: I18nTranslationMap) => string,
): SubmitApplicationRequest => {
  const activeAttachments: Component[] =
    navFormUtils.getActiveAttachmentPanelFromForm(form, submission, 'digitalnologin')?.components ?? [];
  const bruker = extractBruker(form, submission);
  const avsender = extractAvsender(submission);
  if (!bruker && !avsender) {
    throw new Error(`${innsendingsId}: Could not find user nor sender from nologin submission (formPath=${form.path})`);
  }

  return {
    ...(bruker && { bruker: bruker.id }),
    ...(avsender && { avsender }),
    formNumber: form.properties.skjemanummer,
    title: translate(form.title),
    tema: form.properties.tema,
    language,
    mainDocument: base64EncodeByteArray(submissionPdfAsByteArray),
    mainDocumentAlt: base64EncodeByteArray(
      objectToByteArray({
        language,
        data: submission,
      }),
    ),
    attachments:
      submission.attachments
        ?.filter(
          (attachment) =>
            attachment.type === 'personal-id' || activeAttachments.some((c) => c.navId == attachment.navId),
        )
        .map((attachment) => {
          const component = activeAttachments.find((c) => c.navId === attachment.navId);
          return validateAttachment(
            {
              attachmentCode: attachment.type === 'personal-id' ? 'K2' : (component?.properties?.vedleggskode ?? ''),
              label: translate(attachment.title ?? component?.label ?? ''),
              title: translate(component?.properties?.vedleggstittel ?? attachment.title ?? ''),
              uploadStatus: attachment.type === 'personal-id' ? 'LastetOpp' : mapToStatus(attachment.value),
              fileIds: attachment.files?.map((f) => f.fileId),
              description: component?.description ? translate(component?.description) : null,
              formNumberPath: component?.properties?.vedleggskjema,
            },
            component?.navId ?? attachment.type,
          );
        }) ?? [],
    otherUploadAvailable: false,
  };
};

const validateAttachment = (attachment: Attachment, validationId: string): Attachment => {
  if (!attachment.attachmentCode) {
    throw new Error(`Attachment is missing attachmentCode - ${validationId}`);
  }
  if (!attachment.label) {
    throw new Error(`Attachment is missing label - ${validationId}`);
  }
  if (!attachment.title) {
    throw new Error(`Attachment is missing title - ${validationId}`);
  }
  return attachment;
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
