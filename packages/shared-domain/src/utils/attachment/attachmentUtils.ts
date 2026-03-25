import { TFunction } from 'i18next';
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

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const digitalAttachmentLabelKeyMap: Record<
  (typeof attachmentSettingKeys)[number],
  keyof typeof TEXTS.statiske.attachment
> = {
  leggerVedNaa: 'uploadNow',
  ettersender: 'uploadLater',
  nei: 'noAdditionalAttachments',
  levertTidligere: 'alreadySent',
  harIkke: 'dontHave',
  andre: 'other',
  nav: 'navWillFetch',
};

const resolveAttachmentLabelKey = (
  key: keyof AttachmentSettingValues,
  submissionMethod?: SubmissionMethod,
): keyof typeof TEXTS.statiske.attachment => {
  if (submissionMethod === 'digital' || submissionMethod === 'digitalnologin') {
    return digitalAttachmentLabelKeyMap[key];
  }

  return key;
};

const getAttachmentLabel = (key: keyof AttachmentSettingValues, submissionMethod?: SubmissionMethod) =>
  TEXTS.statiske.attachment[resolveAttachmentLabelKey(key, submissionMethod)];

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
              label: translate(getAttachmentLabel(key, submissionMethod)),
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
  translate: TFunction;
  value: SubmissionAttachmentValue;
  component: Component;
  form: NavFormType;
  submissionMethod?: SubmissionMethod;
}): AttachmentValue => {
  const additionalDocumentationLabel = component.attachmentValues?.[value.key]?.additionalDocumentation?.label;
  const shouldShowDeadline =
    !!component.attachmentValues?.[value.key]?.showDeadline && form.properties?.ettersendelsesfrist;

  return {
    description: translate(getAttachmentLabel(value.key, submissionMethod)),
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
  getAttachmentLabel,
  mapToAttachmentSummary,
  mapKeysToOptions,
  resolveAttachmentLabelKey,
};

export { attachmentSettingKeys, attachmentUtils };
