import { FileObject } from '@navikt/ds-react';
import { Submission, SubmissionAttachment, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { Dispatch, SetStateAction } from 'react';
import { getAttachmentsAtPath, setAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { validateTotalFilesSize } from './attachmentValidation';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

const createAttachmentSubmissionActions = (
  submission: Submission | undefined,
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>,
) => {
  const getAttachments = (current: Submission | undefined, submissionPath?: string) =>
    submissionPath ? getAttachmentsAtPath(current, submissionPath) : (current?.attachments ?? []);

  const setAttachments = (
    current: Submission | undefined,
    attachments: SubmissionAttachment[],
    submissionPath?: string,
    multiple = false,
  ): Submission =>
    submissionPath
      ? setAttachmentsAtPath(current, submissionPath, attachments, multiple)
      : ({ ...(current ?? { data: {} }), attachments } as Submission);

  const addFileToSubmission = (file: UploadedFile, submissionPath?: string, multiple = false) => {
    setSubmission((current) => {
      const attachments = getAttachments(current, submissionPath);
      const attachment = attachments.find((entry) => entry.attachmentId === file.attachmentId);
      if (!attachment) {
        throw new Error(`${file.attachmentId} not found`);
      }

      return setAttachments(
        current,
        attachments.map((entry) =>
          entry.attachmentId === file.attachmentId ? { ...entry, files: [...(entry.files ?? []), file] } : entry,
        ),
        submissionPath,
        multiple,
      );
    });
  };

  const removeFileFromSubmission = (
    attachmentId: string,
    fileId: string,
    submissionPath?: string,
    multiple = false,
  ) => {
    setSubmission((current) =>
      setAttachments(
        current,
        getAttachments(current, submissionPath).map((attachment) =>
          attachment.attachmentId === attachmentId
            ? { ...attachment, files: (attachment.files ?? []).filter((file) => file.fileId !== fileId) }
            : attachment,
        ),
        submissionPath,
        multiple,
      ),
    );
  };

  const removeFilesFromSubmission = (attachmentId: string, submissionPath?: string, multiple = false) => {
    setSubmission((current) =>
      setAttachments(
        current,
        getAttachments(current, submissionPath).map((attachment) =>
          attachment.attachmentId === attachmentId ? { ...attachment, files: [] } : attachment,
        ),
        submissionPath,
        multiple,
      ),
    );
  };

  const removeAttachmentFromSubmission = (attachmentId: string, submissionPath?: string, multiple = false) => {
    setSubmission((current) =>
      setAttachments(
        current,
        getAttachments(current, submissionPath).filter((attachment) => attachment.attachmentId !== attachmentId),
        submissionPath,
        multiple,
      ),
    );
  };

  const validateTotalAttachmentSize = (attachmentId: string, file: FileObject, submissionPath?: string) => {
    const attachment = getAttachments(submission, submissionPath).find((entry) => entry.attachmentId === attachmentId);
    return validateTotalFilesSize(MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, [...(attachment?.files ?? []), file.file]);
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    submissionPath?: string,
    multiple = false,
  ) => {
    setSubmission((current) => {
      const attachments = getAttachments(current, submissionPath);
      const currentAttachment = attachments.find((entry) => entry.attachmentId === attachment.attachmentId);
      if (!currentAttachment) {
        return setAttachments(
          current,
          [...attachments, { ...attachment, ...values, files: [] }],
          submissionPath,
          multiple,
        );
      }

      return setAttachments(
        current,
        attachments.map((entry) =>
          entry.attachmentId === attachment.attachmentId
            ? {
                ...entry,
                value: values?.value,
                title: values?.title,
                additionalDocumentation: values?.additionalDocumentation,
              }
            : entry,
        ),
        submissionPath,
        multiple,
      );
    });
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
