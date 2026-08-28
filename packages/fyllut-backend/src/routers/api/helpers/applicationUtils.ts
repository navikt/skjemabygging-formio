import {
  Attachment,
  OpplastingsStatus,
  SubmissionPartyProjection,
  SubmitApplicationRequest,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  AttachmentSettingValues,
  Component,
  Form,
  I18nTranslationMap,
  navFormUtils,
  Submission,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { base64EncodeByteArray } from '../../../utils/base64';
import { objectToByteArray } from './sendInn';

const assembleSubmitApplicationRequest = (
  innsendingsId: string,
  form: Form,
  submission: Submission,
  language: TranslationLang,
  submissionPdfAsByteArray: number[],
  translate: (text: string, textReplacements?: I18nTranslationMap) => string,
  parties: SubmissionPartyProjection,
): SubmitApplicationRequest => {
  const activeAttachments: Component[] =
    navFormUtils.getActiveAttachmentPanelFromForm(form, submission)?.components ?? [];
  const { bruker, avsender } = parties;

  if (!bruker && !avsender) {
    throw new Error(`${innsendingsId}: Party projection contains neither user nor sender (formPath=${form.path})`);
  }

  return {
    ...(bruker && { bruker }),
    ...(avsender && { avsender }),
    formNumber: form.properties.skjemanummer,
    title: translate(form.title),
    tema: form.properties.tema,
    language,
    mainDocument: base64EncodeByteArray(submissionPdfAsByteArray),
    mainDocumentAlt: base64EncodeByteArray(
      objectToByteArray({
        language,
        formRevision: form.revision,
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
    otherUploadAvailable: activeAttachments.some((a) => a.attachmentType === 'other'),
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

export { assembleSubmitApplicationRequest };
