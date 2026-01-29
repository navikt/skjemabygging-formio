import { TFunction } from 'i18next';
import { UploadedFile } from '../file';
import { AttachmentType, Component, ComponentValue, NavFormType } from '../form';
import TEXTS from '../texts';

type AttachmentOption = {
  label: string;
  value: string;
  upload?: boolean;
  additionalDocumentation?: {
    description?: string;
    label?: string;
  };
};

const attachmentSettingKeys = [
  'leggerVedNaa',
  'ettersender',
  'nei',
  'levertTidligere',
  'harIkke',
  'andre',
  'nav',
] as const;

// Saved in form
type AttachmentSettingValues = Partial<Record<(typeof attachmentSettingKeys)[number], AttachmentSettingValue>>;

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

// new interface for storing attachments in submission outside of data
interface SubmissionAttachment {
  attachmentId: string;
  navId: string;
  type: AttachmentType | 'personal-id';
  value?: keyof AttachmentSettingValues;
  title?: string;
  additionalDocumentation?: string;
  files?: UploadedFile[];
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

const renderAttachmentPanel = (submissionMethod?: string) => submissionMethod !== 'digital';

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const mapKeysToOptions = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  translate: (text: string, params?: any) => string,
): ComponentValue[] => {
  if (attachmentValues) {
    if (Array.isArray(attachmentValues)) {
      return attachmentValues;
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
  renderAttachmentPanel,
  enableAttachmentUpload,
  attachmentSettingKeys,
  mapToAttachmentSummary,
  mapKeysToOptions,
};

export default attachmentUtils;
export type {
  AttachmentOption,
  AttachmentSettingValue,
  AttachmentSettingValues,
  AttachmentValue,
  LimitedFormAttachment,
  SubmissionAttachment,
  SubmissionAttachmentValue,
};
