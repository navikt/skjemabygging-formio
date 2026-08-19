import { FileItem, FileObject } from '@navikt/ds-react';
import { ResponseError, Submission, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import { useFyllut } from '../../FyllutContext';
import { useNologinToken } from '../../nologin-token/NologinTokenContext';
import { createAttachmentSubmissionActions } from './attachmentSubmission';
import { normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';
import { getFileValidationError, validateFileUpload } from './attachmentValidation';
import { downloadBlob, getFileUploadApi } from './fileUploadApi';
import { createUploadProgressActions } from './uploadProgress';

type AttachmentErrorType = 'FILE' | 'VALUE' | 'TITLE';
type ActionStatus = 'ok' | 'error' | 'auth-error' | 'invalid' | 'unknown';

interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<{ status: ActionStatus }>;
  handleDownloadFile: (attachmentId: string, fileId: string, fileName: string) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string, file: FileItem) => Promise<void>;
  handleDeleteAllFilesForAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string, type: AttachmentErrorType, pageKey?: string) => void;
  removeError: (attachmentId: string) => void;
  changeAttachmentValue: (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
  ) => void;
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
  changeAttachmentValue: () => {},
  uploadsInProgress: {},
  submissionAttachments: [],
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { http } = useFyllut();
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { submission, setSubmission } = useSubmissionState();
  const { setAttachmentExternalError } = useValidation();
  const { getNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const uploadApi = useMemo(
    () => getFileUploadApi(http, submissionMethod === 'digitalnologin' ? 'nologin' : 'digital', innsendingsId),
    [http, submissionMethod, innsendingsId],
  );
  const submissionActions = createAttachmentSubmissionActions(submission, setSubmission);
  const uploadProgressActions = createUploadProgressActions(setUploadsInProgress);

  const addError = (attachmentId: string, message: string, type: AttachmentErrorType, pageKey?: string) => {
    const field = type === 'VALUE' ? 'value' : type === 'TITLE' ? 'title' : 'files';
    setAttachmentExternalError(attachmentId, field, translate(message), pageKey);
  };

  const removeError = (attachmentId: string) => {
    setAttachmentExternalError(attachmentId, 'value');
    setAttachmentExternalError(attachmentId, 'files');
    setAttachmentExternalError(attachmentId, 'title');
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
        handleSessionExpired();
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
      if (isAuthenticationError(error, http)) {
        handleSessionExpired();
      } else {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteFileError), 'FILE');
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
      if (isAuthenticationError(error, http)) {
        handleSessionExpired();
      } else {
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
      if (isAuthenticationError(error, http)) {
        handleSessionExpired();
      } else {
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
      if (isAuthenticationError(error, http)) {
        handleSessionExpired();
      } else {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteAttachmentError), 'FILE');
      }
      throw error;
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      submission?.attachments?.forEach((attachment) => removeError(attachment.attachmentId));
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
      if (isAuthenticationError(error, http)) {
        handleSessionExpired();
      } else {
        addError('allFiles', translate(TEXTS.statiske.uploadFile.deleteAllFilesError), 'FILE');
      }
      throw error;
    }
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
  ) => {
    if (values?.value) {
      removeError(attachment.attachmentId);
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
    changeAttachmentValue,
    submissionAttachments: submission?.attachments ?? [],
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
export type { AttachmentErrorType };
