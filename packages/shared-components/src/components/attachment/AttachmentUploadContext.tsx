import { FileObject } from '@navikt/ds-react';
import { Submission, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import {
  deleteAllFiles,
  deleteAttachment,
  deleteFile,
  uploadFile,
} from '../../api/nologin-file-upload/nologinFileUpload';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string) => void;
  removeError: (attachmentId: string) => void;
  uploadedFiles: UploadedFile[];
  errors: Record<string, string | undefined>;
  radioState: Record<string, string>;
  setRadioState: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  removeError: () => {},
  uploadedFiles: [],
  errors: {},
  radioState: {},
  setRadioState: () => {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { innsendingsId, setInnsendingsId } = useSendInn();
  const { submission, setSubmission } = useForm();
  const { translate } = useLanguages();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [radioState, setRadioState] = useState<Record<string, string>>({});

  const uploadedFiles = submission?.uploadedFiles ?? [];

  const addToSubmission = (file: UploadedFile) => {
    setSubmission(
      (current) => ({ ...current, uploadedFiles: [...(current?.uploadedFiles ?? []), file] }) as Submission,
    );
  };
  const removeFileFromSubmission = (fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          uploadedFiles: (current?.uploadedFiles ?? []).filter((file) => file.fileId !== fileId),
        }) as Submission,
    );
  };

  const removeFilesFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          uploadedFiles: (current?.uploadedFiles ?? []).filter((file) => file.attachmentId !== attachmentId),
        }) as Submission,
    );
  };

  const addError = (attachmentId: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [attachmentId]: error,
    }));
  };

  const removeError = (attachmentId: string) => {
    setErrors((prev) => {
      const { [attachmentId]: _, ...rest } = prev; // Remove the error for the specific attachmentId
      return rest;
    });
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject) => {
    try {
      removeError(attachmentId);
      const result = await uploadFile(file.file, attachmentId);
      if (result) {
        addToSubmission(result);
        setInnsendingsId(result.innsendingId);
      }
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.uploadFileError));
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      removeError(attachmentId);
      if (!innsendingsId) {
        throw new Error('InnsendingsId is not set');
      }
      await deleteFile(fileId, innsendingsId);
      removeFileFromSubmission(fileId);
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.deleteFileError));
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      if (!innsendingsId) {
        throw new Error('InnsendingsId is not set');
      }
      await deleteAttachment(attachmentId, innsendingsId);
      removeFilesFromSubmission(attachmentId);
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.deleteAttachmentError));
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      setErrors({});
      if (!innsendingsId) {
        throw new Error('InnsendingId is not set');
      }
      await deleteAllFiles(innsendingsId);
      setSubmission((current) => ({ ...current, uploadedFiles: [] }) as Submission);
    } catch (e) {
      addError('allFiles', translate(TEXTS.statiske.uploadId.deleteAllFilesError));
      throw e;
    }
  };

  const value = {
    handleUploadFile,
    handleDeleteFile,
    handleDeleteAttachment,
    handleDeleteAllFiles,
    addError,
    removeError,
    uploadedFiles,
    errors,
    radioState,
    setRadioState,
  };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
