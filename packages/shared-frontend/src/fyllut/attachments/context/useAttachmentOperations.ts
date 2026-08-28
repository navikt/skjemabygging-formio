import { FileItem, FileObject } from '@navikt/ds-react';
import {
  hasErrorCode,
  ResponseError,
  Submission,
  SubmissionAttachment,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { useLanguage } from '../../../context/language/LanguageContext';
import { AttachmentApplication, useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import { downloadBlob } from '../../../utils/blob';
import { useNologinToken } from '../../context/nologin-token/NologinTokenContext';
import { createAttachmentSubmissionActions } from './attachmentSubmission';
import { AttachmentErrorType, AttachmentUploadContextType } from './attachmentUploadTypes';
import { normalizeAttachmentDownloadBlob, normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';
import { validateFileUpload } from './attachmentValidation';
import { createUploadProgressActions } from './uploadProgress';

const getAttachmentApplication = (
  submissionMethod: string | undefined,
  id: string | undefined,
  token: string | undefined,
): AttachmentApplication =>
  submissionMethod === 'digitalnologin' ? { type: 'noLogin', token } : { type: 'draft', id };

const useAttachmentOperations = (): AttachmentUploadContextType => {
  const { attachments, sessions } = useRuntimeServices();
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { submission, setSubmission } = useSubmissionState();
  const { setAttachmentExternalError } = useValidation();
  const { getNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
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

  const handleUploadFile = async (
    attachmentId: string,
    file: FileObject,
    submissionPath?: string,
    multiple = false,
  ) => {
    try {
      uploadProgressActions.addFileInProgress(attachmentId, file);
      removeError(attachmentId);

      if (validateFileUpload(file)) {
        return { status: 'invalid' as const };
      }

      const invalidAttachmentSize = submissionActions.validateTotalAttachmentSize(attachmentId, file, submissionPath);
      if (invalidAttachmentSize) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE');
        return { status: 'invalid' as const };
      }

      const token = await getNologinToken();
      const application = getAttachmentApplication(submissionMethod, innsendingsId, token);
      const result = await attachments.uploadFile({ application, attachmentId, file: file.file });
      if (result) {
        uploadProgressActions.removeAllFilesInProgress(attachmentId, (inProgress) => inProgress.error);
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        submissionActions.addFileToSubmission(result, submissionPath, multiple);
        return { status: 'ok' as const };
      }

      return { status: 'unknown' as const };
    } catch (error: unknown) {
      if (sessions.isAuthenticationError(error)) {
        handleSessionExpired();
        return { status: 'auth-error' as const };
      }

      const userMessage = hasErrorCode(error, 'SERVICE_UNAVAILABLE')
        ? TEXTS.statiske.nologin.temporarilyUnavailable
        : error instanceof ResponseError
          ? error.userMessage
          : undefined;
      uploadProgressActions.addFileInProgress(attachmentId, {
        ...file,
        error: true,
        reasons: [userMessage ?? TEXTS.statiske.uploadFile.uploadFileError],
      });
      return { status: 'error' as const };
    }
  };

  const handleAttachmentRequest = async (
    attachmentId: string,
    errorMessage: string,
    request: (application: AttachmentApplication) => Promise<void>,
    shouldRethrow = false,
  ) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      await request(getAttachmentApplication(submissionMethod, innsendingsId, token));
    } catch (error) {
      if (sessions.isAuthenticationError(error)) {
        handleSessionExpired();
      } else {
        addError(attachmentId, translate(errorMessage), 'FILE');
      }

      if (shouldRethrow) {
        throw error;
      }
    }
  };

  const handleDeleteFile = async (
    attachmentId: string,
    fileId: string,
    _file?: FileItem,
    submissionPath?: string,
    multiple = false,
  ) =>
    handleAttachmentRequest(attachmentId, TEXTS.statiske.uploadFile.deleteFileError, async (application) => {
      await attachments.deleteFile({ application, attachmentId, fileId });
      submissionActions.removeFileFromSubmission(attachmentId, fileId, submissionPath, multiple);
    });

  const handleDownloadFile = async (attachmentId: string, fileId: string, fileName: string) =>
    handleAttachmentRequest(attachmentId, TEXTS.statiske.uploadFile.downloadFileError, async (application) => {
      const downloadedFile = await attachments.downloadFile({ application, attachmentId, fileId });
      downloadBlob(normalizeAttachmentDownloadBlob(downloadedFile), normalizeAttachmentDownloadFileName(fileName));
    });

  const handleDeleteAllFilesForAttachment = async (attachmentId: string, submissionPath?: string, multiple = false) =>
    handleAttachmentRequest(attachmentId, TEXTS.statiske.uploadFile.deleteAttachmentError, async (application) => {
      await attachments.deleteAllFilesForAttachment({ application, attachmentId });
      submissionActions.removeFilesFromSubmission(attachmentId, submissionPath, multiple);
    });

  const handleDeleteAttachment = async (attachmentId: string, submissionPath?: string, multiple = false) =>
    handleAttachmentRequest(
      attachmentId,
      TEXTS.statiske.uploadFile.deleteAttachmentError,
      async (application) => {
        await attachments.deleteAllFilesForAttachment({ application, attachmentId });
        submissionActions.removeAttachmentFromSubmission(attachmentId, submissionPath, multiple);
      },
      true,
    );

  const handleDeleteAllFiles = async () => {
    try {
      submission?.attachments?.forEach((attachment) => removeError(attachment.attachmentId));
      const token = await getNologinToken();
      await attachments.deleteAllFiles(getAttachmentApplication(submissionMethod, innsendingsId, token));
      setSubmission(
        (current) =>
          ({
            ...current,
            attachments: [],
          }) as Submission,
      );
    } catch (error) {
      if (sessions.isAuthenticationError(error)) {
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
    submissionPath?: string,
    multiple = false,
  ) => {
    if (values?.value) {
      removeError(attachment.attachmentId);
    }
    submissionActions.changeAttachmentValue(attachment, values, submissionPath, multiple);
  };

  return {
    addError,
    changeAttachmentValue,
    handleDeleteAllFiles,
    handleDeleteAllFilesForAttachment,
    handleDeleteAttachment,
    handleDeleteFile,
    handleDownloadFile,
    handleUploadFile,
    removeError,
    submissionAttachments: submission?.attachments ?? [],
    uploadsInProgress,
  };
};

export { useAttachmentOperations };
