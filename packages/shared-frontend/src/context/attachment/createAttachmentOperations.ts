import { FileItem, FileObject } from '@navikt/ds-react';
import {
  hasErrorCode,
  ResponseError,
  SubmissionAttachment,
  TEXTS,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction } from 'react';
import { attachmentFieldPath } from '../../components/attachment/attachmentFieldPath';
import { downloadBlob } from '../../utils/blob';
import { AttachmentApplication } from '../runtime-services/RuntimeServicesContext';
import { FieldStateStore } from '../state/StateContext';
import { createAttachmentOperationGuard } from './attachmentOperationGuard';
import { createAttachmentSubmissionActions } from './attachmentSubmission';
import { AttachmentErrorType, AttachmentHost, AttachmentUploadContextType } from './attachmentUploadTypes';
import { normalizeAttachmentDownloadBlob, normalizeAttachmentDownloadFileName } from './attachmentUploadUtils';
import { validateFileUpload } from './attachmentValidation';
import { createUploadProgressActions, UploadsInProgress } from './uploadProgress';

interface AttachmentOperationsInput {
  host: AttachmentHost;
  store: FieldStateStore;
  translate: TranslateFunction;
  setExternalError: (path: string, message?: string, pageKey?: string) => void;
  uploadsInProgress: UploadsInProgress;
  setUploadsInProgress: Dispatch<SetStateAction<UploadsInProgress>>;
  pendingUploads: { current: Map<symbol, PendingAttachmentUpload> };
  generation: { current: number };
}

interface PendingAttachmentUpload {
  attachmentId: string;
  file: File;
}

const createAttachmentOperations = ({
  host,
  store,
  translate,
  setExternalError,
  uploadsInProgress,
  setUploadsInProgress,
  pendingUploads,
  generation,
}: AttachmentOperationsInput): AttachmentUploadContextType => {
  const { service: attachments, isAuthenticationError, handleSessionExpired, getApplication } = host;
  const submissionActions = createAttachmentSubmissionActions(store, host.getAllAttachments);
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
    const guard = createAttachmentOperationGuard(store, attachmentId, submissionPath);
    const requestGeneration = generation.current;
    const requestId = Symbol();
    try {
      uploadProgressActions.addFileInProgress(attachmentId, file);
      removeError(attachmentId, submissionPath);

      if (validateFileUpload(file)) {
        return { status: 'invalid' as const };
      }

      const invalidAttachmentSize = submissionActions.validateTotalAttachmentSize(
        attachmentId,
        file,
        submissionPath,
        [...pendingUploads.current.values()]
          .filter((pending) => pending.attachmentId === attachmentId)
          .map((pending) => pending.file),
      );
      if (invalidAttachmentSize) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE', pageKey, submissionPath);
        return { status: 'invalid' as const };
      }

      if (!guard.isCurrent()) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        return { status: 'unknown' as const };
      }
      pendingUploads.current.set(requestId, { attachmentId, file: file.file });
      const application = await getApplication();
      if (!guard.isCurrent() || requestGeneration !== generation.current) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        return { status: 'unknown' as const };
      }
      const result = await attachments.uploadFile({ application, attachmentId, file: file.file });
      if (result) {
        uploadProgressActions.removeAllFilesInProgress(attachmentId, (inProgress) => inProgress.error);
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        const current = submissionActions
          .getAttachments(submissionPath)
          .find((item) => item.attachmentId === attachmentId);
        if (!current?.value || !guard.isCurrent() || requestGeneration !== generation.current) {
          await attachments.deleteFile({ application, attachmentId, fileId: result.fileId });
          return { status: 'unknown' as const };
        }
        submissionActions.addFileToSubmission(result, submissionPath, multiple);
        host.onUpload?.(current);
        return { status: 'ok' as const };
      }

      uploadProgressActions.addFileInProgress(attachmentId, {
        ...file,
        error: true,
        reasons: [TEXTS.statiske.uploadFile.uploadFileError],
      });
      return { status: 'unknown' as const };
    } catch (error: unknown) {
      if (!guard.isCurrent() || requestGeneration !== generation.current) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
        return { status: 'unknown' as const };
      }
      if (isAuthenticationError(error)) {
        uploadProgressActions.removeFileInProgress(attachmentId, uploadProgressActions.fileIdentifier(file));
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
    } finally {
      pendingUploads.current.delete(requestId);
      guard.release();
    }
  };

  const handleAttachmentRequest = async (
    attachmentId: string,
    errorMessage: string,
    request: (application: AttachmentApplication) => Promise<void>,
    shouldRethrow = false,
    submissionPath?: string,
    isCurrent = () => true,
  ) => {
    try {
      removeError(attachmentId, submissionPath);
      const application = await getApplication();
      if (isCurrent()) await request(application);
    } catch (error) {
      if (isAuthenticationError(error)) {
        handleSessionExpired();
      } else if (isCurrent()) {
        addError(attachmentId, translate(errorMessage), 'FILE', undefined, submissionPath);
      }

      if (shouldRethrow) {
        throw error;
      }
    }
  };

  const deleteFiles = async (
    attachmentId: string,
    fileIds: string[],
    message: string,
    submissionPath?: string,
    multiple = false,
    removeDocument = false,
  ) => {
    const guard = createAttachmentOperationGuard(store, attachmentId, submissionPath);
    try {
      await handleAttachmentRequest(
        attachmentId,
        message,
        async (application) => {
          for (const fileId of fileIds) {
            if (!guard.isCurrent()) return;
            await attachments.deleteFile({ application, attachmentId, fileId });
            if (guard.isCurrent())
              submissionActions.removeFileFromSubmission(attachmentId, fileId, submissionPath, multiple);
          }
          const latest = submissionActions
            .getAttachments(submissionPath)
            .find((item) => item.attachmentId === attachmentId);
          if (removeDocument && guard.isCurrent() && !latest?.files?.length) {
            submissionActions.removeAttachmentFromSubmission(attachmentId, submissionPath, multiple);
          }
        },
        removeDocument,
        submissionPath,
        guard.isCurrent,
      );
    } finally {
      guard.release();
    }
  };

  const handleDeleteFile = async (
    attachmentId: string,
    fileId: string,
    _file?: FileItem,
    submissionPath?: string,
    multiple = false,
  ) => deleteFiles(attachmentId, [fileId], TEXTS.statiske.uploadFile.deleteFileError, submissionPath, multiple);

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
    deleteFiles(
      attachmentId,
      submissionActions
        .getAttachments(submissionPath)
        .find((item) => item.attachmentId === attachmentId)
        ?.files?.map((file) => file.fileId) ?? [],
      TEXTS.statiske.uploadFile.deleteAttachmentError,
      submissionPath,
      multiple,
    );

  const handleDeleteAttachment = async (attachmentId: string, submissionPath?: string, multiple = false) => {
    const currentAttachment = submissionActions
      .getAttachments(submissionPath)
      .find((attachment) => attachment.attachmentId === attachmentId);
    if (!currentAttachment?.files?.length) {
      removeError(attachmentId, submissionPath);
      submissionActions.removeAttachmentFromSubmission(attachmentId, submissionPath, multiple);
      return;
    }

    await deleteFiles(
      attachmentId,
      currentAttachment.files.map((file) => file.fileId),
      TEXTS.statiske.uploadFile.deleteAttachmentError,
      submissionPath,
      multiple,
      true,
    );
  };

  const handleDeleteAllFiles = async () => {
    generation.current += 1;
    try {
      await attachments.deleteAllFiles(await getApplication());
      host.clearFiles();
    } catch (error) {
      if (isAuthenticationError(error)) {
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

export { createAttachmentOperations };
export type { PendingAttachmentUpload };
