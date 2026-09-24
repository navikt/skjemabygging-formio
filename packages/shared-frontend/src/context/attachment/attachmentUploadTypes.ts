import { FileItem, FileObject } from '@navikt/ds-react';
import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { AttachmentApplication, AttachmentService } from '../runtime-services/RuntimeServices';

interface AttachmentHost {
  service: AttachmentService;
  getApplication: () => Promise<AttachmentApplication>;
  isAuthenticationError: (error: unknown) => boolean;
  handleSessionExpired: () => void;
  getAllAttachments: () => SubmissionAttachment[];
  clearFiles: () => void;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

type AttachmentErrorType = 'FILE' | 'VALUE' | 'TITLE';
type AttachmentActionStatus = 'ok' | 'error' | 'auth-error' | 'invalid' | 'unknown';

interface AttachmentUploadContextType {
  handleUploadFile: (
    attachmentId: string,
    file: FileObject,
    submissionPath?: string,
    multiple?: boolean,
    pageKey?: string,
  ) => Promise<{ status: AttachmentActionStatus }>;
  handleDownloadFile: (
    attachmentId: string,
    fileId: string,
    fileName: string,
    submissionPath?: string,
  ) => Promise<void>;
  handleDeleteFile: (
    attachmentId: string,
    fileId: string,
    file: FileItem,
    submissionPath?: string,
    multiple?: boolean,
  ) => Promise<void>;
  handleDeleteAllFilesForAttachment: (
    attachmentId: string,
    submissionPath?: string,
    multiple?: boolean,
  ) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string, submissionPath?: string, multiple?: boolean) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (
    attachmentId: string,
    error: string,
    type: AttachmentErrorType,
    pageKey?: string,
    submissionPath?: string,
  ) => void;
  removeError: (attachmentId: string, submissionPath?: string) => void;
  changeAttachmentValue: (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    submissionPath?: string,
    multiple?: boolean,
  ) => void;
  uploadsInProgress: Record<string, Record<string, FileObject>>;
}

type AttachmentUploadActions = Omit<AttachmentUploadContextType, 'uploadsInProgress'>;

export type {
  AttachmentActionStatus,
  AttachmentErrorType,
  AttachmentHost,
  AttachmentUploadActions,
  AttachmentUploadContextType,
};
