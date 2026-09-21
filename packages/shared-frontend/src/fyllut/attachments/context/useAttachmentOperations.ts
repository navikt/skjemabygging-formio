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
import { getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useFormDefinitionSubmissionMethod } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { AttachmentApplication, useRuntimeServices } from '../../../context/runtime-services/RuntimeServicesContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationActions } from '../../../context/validation/ValidationContext';
import { downloadBlob } from '../../../utils/blob';
import { useNologinToken } from '../../context/nologin-token/NologinTokenContext';
import { attachmentFieldPath } from '../attachmentFieldPath';
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
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate } = useLanguage();
  const { getLatestSubmission, setSubmission, updateSubmission } = useSubmissionState();
  const { setExternalError } = useValidationActions();
  const { getNologinToken, handleSessionExpired } = useNologinToken();
  const { search } = useLocation();
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const innsendingsId = new URLSearchParams(search).get('innsendingsId') ?? undefined;
  const submissionActions = createAttachmentSubmissionActions(getLatestSubmission, setSubmission, updateSubmission);
  const uploadProgressActions = createUploadProgressActions(setUploadsInProgress);

  const addError = (
    attachmentId: string,
    message: string,
    type: AttachmentErrorType,
    pageKey?: string,
    submissionPath?: string,
  ) => {
    const field = type === 'VALUE' ? 'value' : type === 'TITLE' ? 'title' : 'files';
    setExternalError(attachmentFieldPath(submissionPath, attachmentId, field), translate(message), pageKey);
  };

  const removeError = (attachmentId: string, submissionPath?: string) => {
    setExternalError(attachmentFieldPath(submissionPath, attachmentId, 'value'));
    setExternalError(attachmentFieldPath(submissionPath, attachmentId, 'files'));
    setExternalError(attachmentFieldPath(submissionPath, attachmentId, 'title'));
  };

  const handleUploadFile = async (
    attachmentId: string,
    file: FileObject,
    submissionPath?: string,
    multiple = false,
    pageKey?: string,
  ) => {
    try {
      uploadProgressActions.addFileInProgress(attachmentId, file);
      removeError(attachmentId, submissionPath);

      if (validateFileUpload(file)) {
        return { status: 'invalid' as const };
      }

      const invalidAttachmentSize = submissionActions.validateTotalAttachmentSize(attachmentId, file, submissionPath);
      if (invalidAttachmentSize) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE', pageKey, submissionPath);
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
    submissionPath?: string,
  ) => {
    try {
      removeError(attachmentId, submissionPath);
      const token = await getNologinToken();
      await request(getAttachmentApplication(submissionMethod, innsendingsId, token));
    } catch (error) {
      if (sessions.isAuthenticationError(error)) {
        handleSessionExpired();
      } else {
        addError(attachmentId, translate(errorMessage), 'FILE', undefined, submissionPath);
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
    handleAttachmentRequest(
      attachmentId,
      TEXTS.statiske.uploadFile.deleteFileError,
      async (application) => {
        await attachments.deleteFile({ application, attachmentId, fileId });
        submissionActions.removeFileFromSubmission(attachmentId, fileId, submissionPath, multiple);
      },
      false,
      submissionPath,
    );

  const handleDownloadFile = async (attachmentId: string, fileId: string, fileName: string, submissionPath?: string) =>
    handleAttachmentRequest(
      attachmentId,
      TEXTS.statiske.uploadFile.downloadFileError,
      async (application) => {
        const downloadedFile = await attachments.downloadFile({ application, attachmentId, fileId });
        downloadBlob(normalizeAttachmentDownloadBlob(downloadedFile), normalizeAttachmentDownloadFileName(fileName));
      },
      false,
      submissionPath,
    );

  const handleDeleteAllFilesForAttachment = async (attachmentId: string, submissionPath?: string, multiple = false) =>
    handleAttachmentRequest(
      attachmentId,
      TEXTS.statiske.uploadFile.deleteAttachmentError,
      async (application) => {
        await attachments.deleteAllFilesForAttachment({ application, attachmentId });
        submissionActions.removeFilesFromSubmission(attachmentId, submissionPath, multiple);
      },
      false,
      submissionPath,
    );

  const handleDeleteAttachment = async (attachmentId: string, submissionPath?: string, multiple = false) => {
    const currentAttachment = (
      submissionPath ? getAttachmentsAtPath(getLatestSubmission(), submissionPath) : getLatestSubmission()?.attachments
    )?.find((attachment) => attachment.attachmentId === attachmentId);
    if (!currentAttachment?.files?.length) {
      removeError(attachmentId, submissionPath);
      submissionActions.removeAttachmentFromSubmission(attachmentId, submissionPath, multiple);
      return;
    }

    await handleAttachmentRequest(
      attachmentId,
      TEXTS.statiske.uploadFile.deleteAttachmentError,
      async (application) => {
        await attachments.deleteAllFilesForAttachment({ application, attachmentId });
        submissionActions.removeAttachmentFromSubmission(attachmentId, submissionPath, multiple);
      },
      true,
      submissionPath,
    );
  };

  const handleDeleteAllFiles = async () => {
    try {
      getLatestSubmission()?.attachments?.forEach((attachment) => removeError(attachment.attachmentId));
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
      removeError(attachment.attachmentId, submissionPath);
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
    uploadsInProgress,
  };
};

export { useAttachmentOperations };
