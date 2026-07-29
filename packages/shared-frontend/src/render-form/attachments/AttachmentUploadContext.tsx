import { FileItem, FileObject } from '@navikt/ds-react';
import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, createContext, useContext } from 'react';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import type { FormRendererAttachmentAdapter } from '../types';
import { getFileValidationError } from './attachmentFileValidation';
import { AttachmentError, AttachmentErrorType, useAttachmentUploadErrors } from './useAttachmentUploadErrors';
import { useAttachmentUploadFiles } from './useAttachmentUploadFiles';
import { useAttachmentUploadValues } from './useAttachmentUploadValues';

type ActionStatus = 'ok' | 'error' | 'invalid' | 'unknown';

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
  errors: Record<string, AttachmentError[]>;
  uploadsInProgress: Record<string, Record<string, FileObject>>;
  submissionAttachments: SubmissionAttachment[];
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => ({ status: 'unknown' }),
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

const AttachmentUploadProvider = ({
  adapter,
  children,
}: {
  adapter?: FormRendererAttachmentAdapter;
  children: ReactNode;
}) => {
  const { submission, setSubmission } = useSubmissionState();
  const { addError, errors, removeAllErrors, removeError } = useAttachmentUploadErrors();
  const fileActions = useAttachmentUploadFiles({ adapter, submission, setSubmission, addError, removeError });
  const { changeAttachmentValue } = useAttachmentUploadValues({ setSubmission, removeError });
  const handleDeleteAllFiles = async () => {
    if (!adapter) {
      return;
    }
    removeAllErrors();
    await fileActions.handleDeleteAllFiles();
  };
  const value = {
    ...fileActions,
    addError,
    changeAttachmentValue,
    errors,
    handleDeleteAllFiles,
    removeAllErrors,
    removeError,
    submissionAttachments: submission?.attachments ?? [],
  };

  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export { AttachmentUploadProvider, getFileValidationError, useAttachmentUpload };
export type { ActionStatus, AttachmentError, AttachmentErrorType, AttachmentUploadContextType };
