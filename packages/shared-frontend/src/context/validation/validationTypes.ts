type AttachmentField = 'value' | 'files' | 'title';

interface FieldError {
  pageKey: string;
  submissionPath: string;
  field: string;
  message: string;
}

type ExternalAttachmentError = { attachmentId: string; field: AttachmentField; message: string };

export type { AttachmentField, ExternalAttachmentError, FieldError };
