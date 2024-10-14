import { TFunction } from 'i18next';
import { Component, NavFormType } from '../form';
import TEXTS from '../texts';

// Saved in form
interface AttachmentSettingValues {
  leggerVedNaa?: AttachmentSettingValue;
  ettersender?: AttachmentSettingValue;
  nei?: AttachmentSettingValue;
  levertTidligere?: AttachmentSettingValue;
  harIkke?: AttachmentSettingValue;
  andre?: AttachmentSettingValue;
  nav?: AttachmentSettingValue;
}

interface AttachmentSettingValue {
  enabled?: boolean;
  showDeadline?: boolean;
  additionalDocumentation?: {
    enabled: boolean;
    label: string;
    description: string;
  };
}

// Saved in submission
interface SubmissionAttachmentValue {
  key: keyof AttachmentSettingValues;
  additionalDocumentation?: string;
}

// Used in summary/PDF
interface AttachmentValue {
  description: string;
  additionalDocumentation?: string;
  additionalDocumentationLabel?: string;
  deadlineWarning?: string;
}

// Used in fyllut backend endpoint /api/form
interface LimitedFormAttachment {
  key: string;
  description: string;
  additionalDocumentationLabel?: string | null;
  additionalDocumentationDescription?: string | null;
  deadlineWarning?: string | null;
}

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
  mapToAttachmentSummary,
};

export default attachmentUtils;
export type {
  AttachmentSettingValue,
  AttachmentSettingValues,
  AttachmentValue,
  LimitedFormAttachment,
  SubmissionAttachmentValue,
};
