import { createContext, useContext } from 'react';
import { AttachmentUploadContextType } from './attachmentUploadTypes';
import { getFileValidationError } from './attachmentValidation';
import { useAttachmentOperations } from './useAttachmentOperations';

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => ({ status: 'unknown' }),
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
  const value = useAttachmentOperations();

  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export type { AttachmentErrorType } from './attachmentUploadTypes';
export { AttachmentUploadProvider, getFileValidationError, useAttachmentUpload };
