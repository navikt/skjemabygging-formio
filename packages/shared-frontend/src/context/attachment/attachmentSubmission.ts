import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { FieldStateStore } from '../state/StateContext';
import { isSubmissionAttachment } from './attachmentData';
import { validateTotalFilesSize } from './attachmentValidation';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

// A host may adapt this path to storage outside its ordinary form answers.
const standaloneAttachmentsPath = '@attachments';

const readAttachments = (value: unknown): SubmissionAttachment[] =>
  (Array.isArray(value) ? value : [value]).filter(isSubmissionAttachment);

const createAttachmentSubmissionActions = (
  store: Pick<FieldStateStore, 'getValue' | 'setValue'>,
  getAllAttachments: () => SubmissionAttachment[] = () => [],
) => {
  const getAttachments = (submissionPath = standaloneAttachmentsPath) =>
    readAttachments(store.getValue(submissionPath));
  const updateAttachments = (
    update: (attachments: SubmissionAttachment[]) => SubmissionAttachment[],
    submissionPath = standaloneAttachmentsPath,
    multiple = false,
  ) => {
    const current = getAttachments(submissionPath);
    const next = update(current);
    if (next !== current) {
      store.setValue(submissionPath, multiple || submissionPath === standaloneAttachmentsPath ? next : next[0]);
    }
  };

  const addFileToSubmission = (file: UploadedFile, submissionPath?: string, multiple = false) =>
    updateAttachments(
      (attachments) => {
        const attachment = attachments.find((entry) => entry.attachmentId === file.attachmentId);
        // Uploads may complete after their document was removed or its choice cleared.
        if (!attachment?.value) return attachments;
        return attachments.map((entry) =>
          entry.attachmentId === file.attachmentId
            ? { ...entry, files: [...(entry.files ?? []).filter((item) => item.fileId !== file.fileId), file] }
            : entry,
        );
      },
      submissionPath,
      multiple,
    );

  const removeFileFromSubmission = (attachmentId: string, fileId: string, submissionPath?: string, multiple = false) =>
    updateAttachments(
      (attachments) =>
        attachments.map((attachment) =>
          attachment.attachmentId === attachmentId
            ? { ...attachment, files: (attachment.files ?? []).filter((file) => file.fileId !== fileId) }
            : attachment,
        ),
      submissionPath,
      multiple,
    );

  const removeFilesFromSubmission = (
    attachmentId: string,
    submissionPath?: string,
    multiple = false,
    fileIds?: string[],
  ) =>
    updateAttachments(
      (attachments) =>
        attachments.map((attachment) =>
          attachment.attachmentId === attachmentId
            ? {
                ...attachment,
                files: fileIds ? attachment.files?.filter((file) => !fileIds.includes(file.fileId)) : [],
              }
            : attachment,
        ),
      submissionPath,
      multiple,
    );

  const removeAttachmentFromSubmission = (attachmentId: string, submissionPath?: string, multiple = false) =>
    updateAttachments(
      (attachments) => attachments.filter((attachment) => attachment.attachmentId !== attachmentId),
      submissionPath,
      multiple,
    );

  const validateTotalAttachmentSize = (
    attachmentId: string,
    file: FileObject,
    submissionPath?: string,
    pendingFiles: File[] = [],
  ) => {
    const attachments = [...getAllAttachments(), ...getAttachments(submissionPath)].filter(
      (attachment) => attachment.attachmentId === attachmentId,
    );
    const files = new Map(
      attachments.flatMap((attachment) => (attachment.files ?? []).map((item) => [item.fileId, item] as const)),
    );
    return validateTotalFilesSize(MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, [
      ...files.values(),
      ...pendingFiles,
      file.file,
    ]);
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    submissionPath?: string,
    multiple = false,
  ) =>
    updateAttachments(
      (attachments) => {
        const current = attachments.find((entry) => entry.attachmentId === attachment.attachmentId);
        if (!current) return [...attachments, { ...attachment, ...values, files: attachment.files ?? [] }];
        return attachments.map((entry) =>
          entry.attachmentId === attachment.attachmentId ? { ...entry, ...values } : entry,
        );
      },
      submissionPath,
      multiple,
    );

  return {
    getAttachments,
    addFileToSubmission,
    changeAttachmentValue,
    removeAttachmentFromSubmission,
    removeFileFromSubmission,
    removeFilesFromSubmission,
    validateTotalAttachmentSize,
  };
};

export { createAttachmentSubmissionActions, readAttachments, standaloneAttachmentsPath };
