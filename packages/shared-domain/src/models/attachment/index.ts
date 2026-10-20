import type { UploadedFile } from '../file';
import type { AttachmentType } from '../form';

const attachmentSettingKeys = [
  'leggerVedNaa',
  'ettersender',
  'nei',
  'levertTidligere',
  'harIkke',
  'andre',
  'nav',
] as const;

type AttachmentOption = {
  label: string;
  value: string;
  upload?: boolean;
  additionalDocumentation?: {
    description?: string;
    label?: string;
  };
};

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
  key: string;
  additionalDocumentation?: string;
}

// Structured attachment value stored in submission data. Personal ID and legacy form attachments
// may also be present in the top-level submission attachments array.
interface SubmissionAttachment {
  attachmentId: string;
  navId: string;
  type: AttachmentType | 'personal-id';
  value?: string;
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

export { attachmentSettingKeys };
export type {
  AttachmentOption,
  AttachmentSettingValue,
  AttachmentSettingValues,
  AttachmentValue,
  LimitedFormAttachment,
  SubmissionAttachment,
  SubmissionAttachmentValue,
};
