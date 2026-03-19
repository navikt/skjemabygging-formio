import {
  AttachmentSettingValues,
  AttachmentValue,
  Component,
  ComponentValue,
  NavFormType,
  SubmissionAttachmentValue,
  SubmissionMethod,
} from '../../models';
import { TEXTS } from '../../texts';

const attachmentSettingKeys = [
  'leggerVedNaa',
  'ettersender',
  'nei',
  'levertTidligere',
  'harIkke',
  'andre',
  'nav',
] as const;
type AttachmentSettingKey = (typeof attachmentSettingKeys)[number];

const digitalAttachmentLabelBySettingKey: Partial<Record<AttachmentSettingKey, string>> = {
  leggerVedNaa: TEXTS.statiske.attachment.digitalRadioOptions.lasterOppNaa,
  ettersender: TEXTS.statiske.attachment.digitalRadioOptions.sendSenere,
  levertTidligere: TEXTS.statiske.attachment.digitalRadioOptions.levertDokumentasjonTidligere,
  harIkke: TEXTS.statiske.attachment.digitalRadioOptions.harIkkeDokumentasjonen,
  andre: TEXTS.statiske.attachment.digitalRadioOptions.sendesAvAndre,
  nav: TEXTS.statiske.attachment.digitalRadioOptions.navKanHenteDokumentasjon,
};

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const getAttachmentOptionLabel = (key: AttachmentSettingKey, submissionMethod?: SubmissionMethod): string => {
  if (submissionMethod === 'digital' || submissionMethod === 'digitalnologin') {
    return digitalAttachmentLabelBySettingKey[key] ?? TEXTS.statiske.attachment[key];
  }

  return TEXTS.statiske.attachment[key];
};

const mapKeysToOptions = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  translate: (text: string, params?: any) => string,
  submissionMethod?: SubmissionMethod,
): ComponentValue[] => {
  if (attachmentValues) {
    if (Array.isArray(attachmentValues)) {
      return attachmentValues.map((option) => ({
        ...option,
        label: translate(option.label),
        ...(option.description ? { description: translate(option.description) } : {}),
      }));
    } else if (typeof attachmentValues === 'object') {
      // map over attachmentSettingKeys to ensure a fixed order
      return attachmentSettingKeys
        .map((key) => {
          const values = attachmentValues[key];
          if (!values?.enabled) {
            return undefined;
          } else {
            return {
              value: key,
              label: translate(getAttachmentOptionLabel(key, submissionMethod)),
              upload: shouldEnableUpload(key),
            };
          }
        })
        .filter((values) => !!values) as ComponentValue[];
    }
  }
  return [];
};

const mapToAttachmentSummary = ({
  translate,
  value,
  component,
  form,
  submissionMethod,
}: {
  translate: (text: string, params?: any) => string;
  value: SubmissionAttachmentValue;
  component: Component;
  form: NavFormType;
  submissionMethod?: SubmissionMethod;
}): AttachmentValue => {
  const additionalDocumentationLabel = component.attachmentValues?.[value.key]?.additionalDocumentation?.label;
  const shouldShowDeadline =
    !!component.attachmentValues?.[value.key]?.showDeadline && form.properties?.ettersendelsesfrist;

  return {
    description: translate(getAttachmentOptionLabel(value.key as AttachmentSettingKey, submissionMethod)),
    ...(additionalDocumentationLabel && { additionalDocumentationLabel: translate(additionalDocumentationLabel) }),
    ...(value.additionalDocumentation && { additionalDocumentation: translate(value.additionalDocumentation) }),
    ...(shouldShowDeadline && {
      deadlineWarning: translate(TEXTS.statiske.attachment.deadline, {
        deadline: form.properties?.ettersendelsesfrist,
      }),
    }),
  };
};

const attachmentUtils = {
  enableAttachmentUpload,
  getAttachmentOptionLabel,
  mapToAttachmentSummary,
  mapKeysToOptions,
};

export { attachmentSettingKeys, attachmentUtils };
