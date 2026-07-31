import { FileItem, FileObject } from '@navikt/ds-react';
import { ResponseError, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useSubmissionState } from '../framework';
import { useNologinToken } from '../nologin-token/NologinTokenContext';
import { createAttachmentSubmissionActions } from './attachmentSubmission';
import { normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';
import { getFileValidationError, validateFileUpload } from './attachmentValidation';
import { downloadBlob, getFileUploadApi } from './fileUploadApi';
import { createUploadProgressActions } from './uploadProgress';

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
  const { submissionMethod, http } = useFyllutAppConfig();
  const { translate } = useFyllutLanguage();
  const { submission, setSubmission } = useSubmissionState();
  const { getNologinToken } = useNologinToken();
  const { search } = useLocation();
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const [errors, setErrors] = useState<Record<string, Array<AttachmentError>>>({});
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const uploadApi = useMemo(
    () => getFileUploadApi(http, submissionMethod === 'digitalnologin' ? 'nologin' : 'digital', innsendingsId),
    [http, submissionMethod, innsendingsId],
  );
  const submissionActions = createAttachmentSubmissionActions(submission, setSubmission);
  const uploadProgressActions = createUploadProgressActions(setUploadsInProgress);

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

  const handleUploadFile = async (attachmentId: string, file: FileObject): Promise<{ status: ActionStatus }> => {
    try {
      uploadProgressActions.addFileInProgress(attachmentId, file);
      removeError(attachmentId);

      if (validateFileUpload(file)) {
        return Promise.resolve({ status: 'invalid' });
      }

      const invalidAttachmentSize = submissionActions.validateTotalAttachmentSize(attachmentId, file);
      if (invalidAttachmentSize) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE');
        return Promise.resolve({ status: 'invalid' });
      }

      const token = await getNologinToken();
      const result = await uploadApi.uploadFile(file.file, attachmentId, token);
      if (result) {
        uploadProgressActions.removeAllFilesInProgress(attachmentId, (inProgress) => inProgress.error);
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        submissionActions.addFileToSubmission(result);
        return Promise.resolve({ status: 'ok' });
      }

      return Promise.resolve({ status: 'unknown' });
    } catch (error: unknown) {
      if (isAuthenticationError(error, http)) {
        return Promise.resolve({ status: 'auth-error' });
      }

      const userMessage = error instanceof ResponseError ? error.userMessage : undefined;
      uploadProgressActions.addFileInProgress(attachmentId, {
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
      submissionActions.removeFileFromSubmission(attachmentId, fileId);
    } catch (error) {
      if (!isAuthenticationError(error, http)) {
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
      if (!isAuthenticationError(error, http)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.downloadFileError), 'FILE');
      }
    }
  };

  const handleDeleteAllFilesForAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await uploadApi.deleteAllFilesForAttachment(attachmentId, token);
      submissionActions.removeFilesFromSubmission(attachmentId);
    } catch (error) {
      if (!isAuthenticationError(error, http)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteAttachmentError), 'FILE');
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await uploadApi.deleteAllFilesForAttachment(attachmentId, token);
      submissionActions.removeAttachmentFromSubmission(attachmentId);
    } catch (error) {
      if (!isAuthenticationError(error, http)) {
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
      if (!isAuthenticationError(error, http)) {
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

    submissionActions.changeAttachmentValue(attachment, values);
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

const isAuthenticationError = (
  error: unknown,
  http?: { isAuthenticationError: (error: unknown) => boolean },
): boolean => http?.isAuthenticationError(error) ?? false;

export { AttachmentUploadProvider, getFileValidationError, useAttachmentUpload };
export type { AttachmentError, AttachmentErrorType };
