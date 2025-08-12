import { FileObject } from '@navikt/ds-react';
import { Submission, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { deleteAttachment, deleteFile, uploadFile } from '../../api/nologin-file-upload/nologinFileUpload';
import { useForm } from '../../context/form/FormContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';

interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  addError: (attachmentId: string, error: string) => void;
  uploadedFiles: UploadedFile[];
  errors: Record<string, string | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAttachment: async () => {},
  addError: () => {},
  uploadedFiles: [],
  errors: {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const { innsendingsId, setInnsendingsId } = useSendInn();
  const { submission, setSubmission } = useForm();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

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

  console.log(uploadedFiles);
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
      addError(attachmentId, 'Det oppstod en feil under opplasting av filen. Prøv igjen senere.');
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      if (!innsendingsId) {
        throw new Error('InnsendingsId is not set');
      }
      await deleteFile(fileId, innsendingsId);
      removeError(attachmentId);
      removeFileFromSubmission(fileId);
    } catch (_e) {
      addError(attachmentId, 'Det oppstod en feil under sletting av filen. Prøv igjen senere.');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      if (!innsendingsId) {
        throw new Error('InnsendingsId is not set');
      }
      await deleteAttachment(attachmentId, innsendingsId);
      removeError(attachmentId);
      removeFilesFromSubmission(attachmentId);
    } catch (e) {
      addError(attachmentId, 'Det oppstod en feil under sletting av vedlegget. Prøv igjen senere.');
      throw e;
    }
  };

  const value = {
    handleUploadFile,
    handleDeleteFile,
    handleDeleteAttachment,
    addError,
    uploadedFiles,
    errors,
  };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
