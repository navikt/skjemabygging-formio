import { FileObject } from '@navikt/ds-react';
import { Submission, SubmissionAttachment, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction } from 'react';
import { validateTotalFilesSize } from './attachmentValidation';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

const createAttachmentSubmissionActions = (
  submission: Submission | undefined,
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>,
) => {
  const addFileToSubmission = (file: UploadedFile) => {
    setSubmission((current) => {
      const attachment = current?.attachments?.find((entry) => entry.attachmentId === file.attachmentId);
      if (!attachment) {
        throw new Error(`${file.attachmentId} not found`);
      }

      return {
        ...current,
        data: { ...current?.data },
        attachments: (current?.attachments ?? []).map((entry) =>
          entry.attachmentId === file.attachmentId ? { ...entry, files: [...(entry.files ?? []), file] } : entry,
        ),
      } as Submission;
    });
  };

  const removeFileFromSubmission = (attachmentId: string, fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((attachment) =>
            attachment.attachmentId === attachmentId
              ? { ...attachment, files: (attachment.files ?? []).filter((file) => file.fileId !== fileId) }
              : attachment,
          ),
        }) as Submission,
    );
  };

  const removeFilesFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((attachment) =>
            attachment.attachmentId === attachmentId ? { ...attachment, files: [] } : attachment,
          ),
        }) as Submission,
    );
  };

  const removeAttachmentFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).filter((attachment) => attachment.attachmentId !== attachmentId),
        }) as Submission,
    );
  };

  const validateTotalAttachmentSize = (attachmentId: string, file: FileObject) => {
    const attachment = submission?.attachments?.find((entry) => entry.attachmentId === attachmentId);
    return validateTotalFilesSize(MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, [...(attachment?.files ?? []), file.file]);
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
  ) => {
    setSubmission((current) => {
      const currentAttachment = current?.attachments?.find((entry) => entry.attachmentId === attachment.attachmentId);
      if (!currentAttachment) {
        return {
          ...current,
          attachments: [...(current?.attachments ?? []), { ...attachment, ...values, files: [] }],
        } as Submission;
      }

      return {
        ...current,
        attachments: (current?.attachments ?? []).map((entry) =>
          entry.attachmentId === attachment.attachmentId
            ? {
                ...entry,
                value: values?.value,
                title: values?.title,
                additionalDocumentation: values?.additionalDocumentation,
              }
            : entry,
        ),
      } as Submission;
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
