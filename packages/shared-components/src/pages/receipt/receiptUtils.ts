import { NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';

export type ReceiptDocumentItem = {
  id: string;
  title: string;
  fileCount?: number;
  type: 'main' | 'attachment';
};

type SubmissionAttachmentWithFiles = NonNullable<Submission['attachments']>[number];

export const getAttachmentsWithFiles = (submission?: Submission): SubmissionAttachmentWithFiles[] => {
  return (submission?.attachments ?? []).filter((attachment) => (attachment.files?.length ?? 0) > 0);
};

export const buildReceiptDocumentItems = (
  form: NavFormType | undefined,
  attachments: SubmissionAttachmentWithFiles[],
): ReceiptDocumentItem[] => {
  const items: ReceiptDocumentItem[] = [];

  if (form) {
    items.push({ id: 'main-form', title: form.title, type: 'main' });
  }

  attachments.forEach((attachment) => {
    items.push({
      id: attachment.attachmentId,
      title: attachment.title ?? attachment.attachmentId,
      fileCount: attachment.files?.length,
      type: 'attachment',
    });
  });

  return items;
};
