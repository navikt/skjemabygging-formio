import { FileItem, FileObject } from '@navikt/ds-react';
import { http, useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import {
  ResponseError,
  Submission,
  SubmissionAttachment,
  TEXTS,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useSubmissionState } from '@navikt/skjemadigitalisering-shared-frontend';
import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useNologinToken } from '../nologin-token/NologinTokenContext';
import { normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';
import { getFileValidationError, validateFileUpload, validateTotalFilesSize } from './attachmentValidation';
import { downloadBlob, getFileUploadApi } from './fileUploadApi';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

type AttachmentErrorType = 'FILE' | 'VALUE' | 'TITLE';
type AttachmentError = { message: string; type: AttachmentErrorType };
type ActionStatus = 'ok' | 'error' | 'auth-error' | 'invalid' | 'unknown';

interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<{ status: ActionStatus }>;
  handleDownloadFile: (attachmentId: string, fileId: string, fileName: string) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string, file: FileItem) => Promise<void>;
  handleDeleteAllFilesForAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string, type: AttachmentErrorType) => void;
  removeError: (attachmentId: string) => void;
  removeAllErrors: () => void;
  changeAttachmentValue: (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    validator?: { validate: (label: string, attachment: SubmissionAttachment) => string | undefined },
  ) => void;
  errors: Record<string, Array<AttachmentError>>;
  uploadsInProgress: Record<string, Record<string, FileObject>>;
  submissionAttachments: SubmissionAttachment[];
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => Promise.resolve({ status: 'unknown' }),
  handleDownloadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAllFilesForAttachment: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  removeError: () => {},
  removeAllErrors: () => {},
  changeAttachmentValue: () => {},
  errors: {},
  uploadsInProgress: {},
  submissionAttachments: [],
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  const { submission, setSubmission } = useSubmissionState();
  const { getNologinToken } = useNologinToken();
  const { search } = useLocation();
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const [errors, setErrors] = useState<Record<string, Array<AttachmentError>>>({});
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const uploadApi = useMemo(
    () => getFileUploadApi(submissionMethod === 'digitalnologin' ? 'nologin' : 'digital', innsendingsId),
    [submissionMethod, innsendingsId],
  );

  const fileIdentifier = (file: FileObject) => `${file.file.name}-${file.file.size}`;

  const addError = (attachmentId: string, message: string, type: AttachmentErrorType) => {
    setErrors((prev) => {
      const existingErrorIndex = prev[attachmentId]?.findIndex((error) => error.type === type);
      if (existingErrorIndex !== undefined && existingErrorIndex >= 0) {
        const updatedErrors = [...(prev[attachmentId] ?? [])];
        updatedErrors[existingErrorIndex] = { message, type };
        return {
          ...prev,
          [attachmentId]: updatedErrors,
        };
      }
      return {
        ...prev,
        [attachmentId]: [...(prev[attachmentId] ?? []), { message, type }],
      };
    });
  };

  const removeError = (attachmentId: string) => {
    setErrors((prev) => {
      const { [attachmentId]: _, ...rest } = prev;
      return rest;
    });
  };

  const removeAllErrors = () => {
    setErrors({});
  };

  const addFileToSubmission = (file: UploadedFile) => {
    setSubmission((current) => {
      const attachment = current?.attachments?.find((att) => att.attachmentId === file.attachmentId);
      if (!attachment) {
        throw new Error(`${file.attachmentId} not found`);
      }

      return {
        ...current,
        data: { ...current?.data },
        attachments: (current?.attachments ?? []).map((att) => {
          if (att.attachmentId === file.attachmentId) {
            return { ...att, files: [...(att.files ?? []), file] };
          }
          return att;
        }),
      } as Submission;
    });
  };

  const removeFileFromSubmission = (attachmentId: string, fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((att) => {
            if (att.attachmentId === attachmentId) {
              return { ...att, files: (att.files ?? []).filter((file) => file.fileId !== fileId) };
            }
            return att;
          }),
        }) as Submission,
    );
  };

  const removeFilesFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((att) => {
            if (att.attachmentId === attachmentId) {
              return { ...att, files: [] };
            }
            return att;
          }),
        }) as Submission,
    );
  };

  const removeAttachmentFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).filter((att) => att.attachmentId !== attachmentId),
        }) as Submission,
    );
  };

  const validateTotalAttachmentSize = (attachmentId: string, file: FileObject): string | undefined => {
    const attachment = submission?.attachments?.find(
      (currentAttachment) => currentAttachment.attachmentId === attachmentId,
    );
    return validateTotalFilesSize(MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES, [...(attachment?.files ?? []), file.file]);
  };

  const addFileInProgress = (attachmentId: string, file: FileObject) => {
    setUploadsInProgress((current) => {
      const currentFiles = current[attachmentId] ?? {};
      const identifier = fileIdentifier(file);
      return { ...current, [attachmentId]: { ...currentFiles, [identifier]: file } };
    });
  };

  const removeAllFilesInProgress = (attachmentId: string, predicate?: (file: FileObject) => boolean) => {
    setUploadsInProgress((current) => {
      const { [attachmentId]: currentFiles, ...rest } = current;
      if (!predicate) {
        return rest;
      }

      const filteredFiles = Object.fromEntries(
        Object.entries(currentFiles ?? {}).filter(([_, file]) => !predicate(file)),
      );
      return { ...rest, [attachmentId]: filteredFiles };
    });
  };

  const removeFileInProgress = (attachmentId: string, identifier: string) => {
    setUploadsInProgress((current) => {
      const currentFiles = current[attachmentId] ?? {};
      if (!currentFiles[identifier]) {
        return current;
      }
      const { [identifier]: _, ...rest } = currentFiles;
      return { ...current, [attachmentId]: rest };
    });
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject): Promise<{ status: ActionStatus }> => {
    try {
      addFileInProgress(attachmentId, file);
      removeError(attachmentId);

      if (validateFileUpload(file)) {
        return Promise.resolve({ status: 'invalid' });
      }

      const invalidAttachmentSize = validateTotalAttachmentSize(attachmentId, file);
      if (invalidAttachmentSize) {
        removeFileInProgress(attachmentId, fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE');
        return Promise.resolve({ status: 'invalid' });
      }

      const token = await getNologinToken();
      const result = await uploadApi.uploadFile(file.file, attachmentId, token);
      if (result) {
        removeAllFilesInProgress(attachmentId, (inProgress) => inProgress.error);
        removeFileInProgress(attachmentId, fileIdentifier(file));
        addFileToSubmission(result);
        return Promise.resolve({ status: 'ok' });
      }

      return Promise.resolve({ status: 'unknown' });
    } catch (error: unknown) {
      if (isAuthenticationError(error)) {
        return Promise.resolve({ status: 'auth-error' });
      }

      const userMessage = error instanceof ResponseError ? error.userMessage : undefined;
      addFileInProgress(attachmentId, {
        ...file,
        error: true,
        reasons: [userMessage ?? TEXTS.statiske.uploadFile.uploadFileError],
      });
      return Promise.resolve({ status: 'error' });
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await uploadApi.deleteFile(attachmentId, fileId, token);
      removeFileFromSubmission(attachmentId, fileId);
    } catch (error) {
      if (!isAuthenticationError(error)) {
        addError(fileId, translate(TEXTS.statiske.uploadFile.deleteFileError), 'FILE');
      }
    }
  };

  const handleDownloadFile = async (attachmentId: string, fileId: string, fileName: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      const downloadedFile = await uploadApi.downloadFile(attachmentId, fileId, token);
      downloadBlob(downloadedFile, normalizeAttachmentDownloadFileName(fileName));
    } catch (error) {
      if (!isAuthenticationError(error)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.downloadFileError), 'FILE');
      }
    }
  };

  const handleDeleteAllFilesForAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await uploadApi.deleteAllFilesForAttachment(attachmentId, token);
      removeFilesFromSubmission(attachmentId);
    } catch (error) {
      if (!isAuthenticationError(error)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteAttachmentError), 'FILE');
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await uploadApi.deleteAllFilesForAttachment(attachmentId, token);
      removeAttachmentFromSubmission(attachmentId);
    } catch (error) {
      if (!isAuthenticationError(error)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteAttachmentError), 'FILE');
      }
      throw error;
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      setErrors({});
      const token = await getNologinToken();
      await uploadApi.deleteAllFiles(token);
      setSubmission(
        (current) =>
          ({
            ...current,
            attachments: [],
          }) as Submission,
      );
    } catch (error) {
      if (!isAuthenticationError(error)) {
        addError('allFiles', translate(TEXTS.statiske.uploadFile.deleteAllFilesError), 'FILE');
      }
      throw error;
    }
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    validator?: { validate: (label: string, attachment: SubmissionAttachment) => string | undefined },
  ) => {
    if (validator) {
      const error = validator.validate('', { ...attachment, ...values });
      if (!error) {
        removeError(attachment.attachmentId);
      }
    }

    setSubmission((current) => {
      const currentAttachment = current?.attachments?.find((att) => att.attachmentId === attachment.attachmentId);
      if (!currentAttachment) {
        return {
          ...current,
          attachments: [...(current?.attachments ?? []), { ...attachment, ...values, files: [] }],
        } as Submission;
      }

      return {
        ...current,
        attachments: (current?.attachments ?? []).map((att) => {
          if (att.attachmentId !== attachment.attachmentId) {
            return att;
          }
          return {
            ...att,
            value: values?.value,
            title: values?.title,
            additionalDocumentation: values?.additionalDocumentation,
          };
        }),
      } as Submission;
    });
  };

  const value = {
    handleUploadFile,
    handleDownloadFile,
    handleDeleteFile,
    handleDeleteAllFilesForAttachment,
    handleDeleteAttachment,
    handleDeleteAllFiles,
    addError,
    removeError,
    removeAllErrors,
    changeAttachmentValue,
    submissionAttachments: submission?.attachments ?? [],
    errors,
    uploadsInProgress,
  };

  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

const isAuthenticationError = (error: unknown): boolean => http.isAuthenticationError(error);

export { AttachmentUploadProvider, getFileValidationError, useAttachmentUpload };
export type { AttachmentError, AttachmentErrorType };
