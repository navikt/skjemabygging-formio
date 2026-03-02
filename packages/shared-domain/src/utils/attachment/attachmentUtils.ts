import { TFunction } from 'i18next';
import {
  AttachmentSettingValues,
  AttachmentValue,
  Component,
  ComponentValue,
  NavFormType,
  SubmissionAttachmentValue,
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

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const mapKeysToOptions = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  translate: (text: string, params?: any) => string,
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
              label: translate(TEXTS.statiske.attachment[key]),
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
}: {
  translate: TFunction;
  value: SubmissionAttachmentValue;
  component: Component;
  form: NavFormType;
}): AttachmentValue => {
  const additionalDocumentationLabel = component.attachmentValues?.[value.key]?.additionalDocumentation?.label;
  const shouldShowDeadline =
    !!component.attachmentValues?.[value.key]?.showDeadline && form.properties?.ettersendelsesfrist;

  return {
    description: translate(TEXTS.statiske.attachment[value.key]),
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
  mapToAttachmentSummary,
  mapKeysToOptions,
};

export { attachmentSettingKeys, attachmentUtils };
