import { FileObject } from '@navikt/ds-react';
import { Submission, SubmissionAttachment, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { Dispatch, SetStateAction } from 'react';
import { getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { validateTotalFilesSize } from './attachmentValidation';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

const createAttachmentSubmissionActions = (
  getSubmission: () => Submission | undefined,
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>,
  updateSubmission: (submissionPath: string, value: unknown) => void,
) => {
  const getAttachments = (current: Submission | undefined, submissionPath?: string) =>
    submissionPath ? getAttachmentsAtPath(current, submissionPath) : (current?.attachments ?? []);

  const updateAttachments = (
    update: (attachments: SubmissionAttachment[]) => SubmissionAttachment[],
    submissionPath?: string,
    multiple = false,
  ) => {
    if (submissionPath) {
      const attachments = update(getAttachments(getSubmission(), submissionPath));
      updateSubmission(submissionPath, multiple ? attachments : attachments[0]);
      return;
    }

    setSubmission((current) => ({
      ...(current ?? { data: {} }),
      attachments: update(current?.attachments ?? []),
    }));
  };

  const addFileToSubmission = (file: UploadedFile, submissionPath?: string, multiple = false) => {
    updateAttachments(
      (attachments) => {
        const attachment = attachments.find((entry) => entry.attachmentId === file.attachmentId);
        if (!attachment) {
          throw new Error(`${file.attachmentId} not found`);
        }

        return attachments.map((entry) =>
          entry.attachmentId === file.attachmentId ? { ...entry, files: [...(entry.files ?? []), file] } : entry,
        );
      },
      submissionPath,
      multiple,
    );
  };

  const removeFileFromSubmission = (
    attachmentId: string,
    fileId: string,
    submissionPath?: string,
    multiple = false,
  ) => {
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
  };

  const removeFilesFromSubmission = (attachmentId: string, submissionPath?: string, multiple = false) => {
    updateAttachments(
      (attachments) =>
        attachments.map((attachment) =>
          attachment.attachmentId === attachmentId ? { ...attachment, files: [] } : attachment,
        ),
      submissionPath,
      multiple,
    );
  };

  const removeAttachmentFromSubmission = (attachmentId: string, submissionPath?: string, multiple = false) => {
    updateAttachments(
      (attachments) => attachments.filter((attachment) => attachment.attachmentId !== attachmentId),
      submissionPath,
      multiple,
    );
  };

  const validateTotalAttachmentSize = (attachmentId: string, file: FileObject, submissionPath?: string) => {
    const attachment = getAttachments(getSubmission(), submissionPath).find(
      (entry) => entry.attachmentId === attachmentId,
    );
    return validateTotalFilesSize(MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, [...(attachment?.files ?? []), file.file]);
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    submissionPath?: string,
    multiple = false,
  ) => {
    updateAttachments(
      (attachments) => {
        const currentAttachment = attachments.find((entry) => entry.attachmentId === attachment.attachmentId);
        if (!currentAttachment) {
          return [...attachments, { ...attachment, ...values, files: [] }];
        }

        return attachments.map((entry) =>
          entry.attachmentId === attachment.attachmentId
            ? {
                ...entry,
                value: values?.value,
                title: values?.title,
                additionalDocumentation: values?.additionalDocumentation,
              }
            : entry,
        );
      },
      submissionPath,
      multiple,
    );
  };

  return {
    addFileToSubmission,
    changeAttachmentValue,
    removeAttachmentFromSubmission,
    removeFileFromSubmission,
    removeFilesFromSubmission,
    validateTotalAttachmentSize,
  };
};

export { createAttachmentSubmissionActions };
