import { FileItem, FileObject } from '@navikt/ds-react';
import { Submission, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction, useState } from 'react';
import type { FormRendererAttachmentAdapter } from '../types';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, getFileValidationError } from './attachmentFileValidation';
import type { AttachmentErrorType } from './useAttachmentUploadErrors';

const useAttachmentUploadFiles = ({
  adapter,
  submission,
  setSubmission,
  addError,
  removeError,
}: {
  adapter?: FormRendererAttachmentAdapter;
  submission?: Submission;
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  addError: (attachmentId: string, error: string, type: AttachmentErrorType) => void;
  removeError: (attachmentId: string) => void;
}) => {
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const fileIdentifier = (file: FileObject) => `${file.file.name}-${file.file.size}`;

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

  const updateAttachmentFiles = (attachmentId: string, files: UploadedFile[]) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((attachment) =>
            attachment.attachmentId === attachmentId ? { ...attachment, files } : attachment,
          ),
        }) as Submission,
    );
  };

  const addFileInProgress = (attachmentId: string, file: FileObject) => {
    setUploadsInProgress((current) => ({
      ...current,
      [attachmentId]: { ...(current[attachmentId] ?? {}), [fileIdentifier(file)]: file },
    }));
  };

  const removeFileInProgress = (attachmentId: string, identifier: string) => {
    setUploadsInProgress((current) => {
      const { [identifier]: _removed, ...remainingFiles } = current[attachmentId] ?? {};
      return { ...current, [attachmentId]: remainingFiles };
    });
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject) => {
    addFileInProgress(attachmentId, file);
    removeError(attachmentId);
    const validationError = getFileValidationError(file);
    if (validationError) {
      return { status: 'invalid' as const };
    }

    const attachment = submission?.attachments?.find((entry) => entry.attachmentId === attachmentId);
    const totalSize = [...(attachment?.files ?? []), file.file].reduce((sum, entry) => sum + entry.size, 0);
    if (totalSize > MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES) {
      removeFileInProgress(attachmentId, fileIdentifier(file));
      addError(attachmentId, TEXTS.statiske.uploadFile.totalFileSizeTooLarge, 'FILE');
      return { status: 'invalid' as const };
    }

    if (!adapter) {
      removeFileInProgress(attachmentId, fileIdentifier(file));
      return { status: 'unknown' as const };
    }

    try {
      const uploadedFile = await adapter.uploadFile(attachmentId, file.file);
      removeFileInProgress(attachmentId, fileIdentifier(file));
      addFileToSubmission(uploadedFile);
      return { status: 'ok' as const };
    } catch {
      setUploadsInProgress((current) => ({
        ...current,
        [attachmentId]: {
          ...(current[attachmentId] ?? {}),
          [fileIdentifier(file)]: {
            ...file,
            error: true,
            reasons: [TEXTS.statiske.uploadFile.uploadFileError],
          },
        },
      }));
      return { status: 'error' as const };
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string, _file: FileItem) => {
    if (!adapter) {
      return;
    }
    try {
      removeError(attachmentId);
      await adapter.deleteFile(attachmentId, fileId);
      const files = submission?.attachments?.find((entry) => entry.attachmentId === attachmentId)?.files ?? [];
      updateAttachmentFiles(
        attachmentId,
        files.filter((file) => file.fileId !== fileId),
      );
    } catch {
      addError(fileId, TEXTS.statiske.uploadFile.deleteFileError, 'FILE');
    }
  };

  const handleDownloadFile = async (attachmentId: string, fileId: string, fileName: string) => {
    if (!adapter) {
      return;
    }
    try {
      removeError(attachmentId);
      await adapter.downloadFile(attachmentId, fileId, fileName);
    } catch {
      addError(attachmentId, TEXTS.statiske.uploadFile.downloadFileError, 'FILE');
    }
  };

  const handleDeleteAllFilesForAttachment = async (attachmentId: string) => {
    if (!adapter) {
      return;
    }
    try {
      removeError(attachmentId);
      await adapter.deleteAllFilesForAttachment(attachmentId);
      updateAttachmentFiles(attachmentId, []);
    } catch {
      addError(attachmentId, TEXTS.statiske.uploadFile.deleteAttachmentError, 'FILE');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!adapter) {
      return;
    }
    try {
      removeError(attachmentId);
      await adapter.deleteAllFilesForAttachment(attachmentId);
      setSubmission(
        (current) =>
          ({
            ...current,
            attachments: (current?.attachments ?? []).filter((attachment) => attachment.attachmentId !== attachmentId),
          }) as Submission,
      );
    } catch (error) {
      addError(attachmentId, TEXTS.statiske.uploadFile.deleteAttachmentError, 'FILE');
      throw error;
    }
  };

  const handleDeleteAllFiles = async () => {
    if (!adapter) {
      return;
    }
    await adapter.deleteAllFiles();
    setSubmission((current) => ({ ...current, attachments: [] }) as Submission);
  };

  return {
    handleDeleteAllFiles,
    handleDeleteAllFilesForAttachment,
    handleDeleteAttachment,
    handleDeleteFile,
    handleDownloadFile,
    handleUploadFile,
    uploadsInProgress,
  };
};

export { useAttachmentUploadFiles };
