type AttachmentField = 'value' | 'files' | 'title' | 'additionalDocumentation';

const attachmentFieldPath = (submissionPath: string | undefined, attachmentId: string, field: AttachmentField) => {
  if (!submissionPath) {
    return `attachments.${attachmentId}.${field}`;
  }
  return field === 'value' ? submissionPath : `${submissionPath}.${attachmentId}.${field}`;
};

export { attachmentFieldPath };
export type { AttachmentField };
