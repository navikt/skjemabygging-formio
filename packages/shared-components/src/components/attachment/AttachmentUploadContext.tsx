import { FileObject } from '@navikt/ds-react';
import { Submission, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { deleteAttachment, deleteFile, uploadFile } from '../../api/nologin-file-upload/nologinFileUpload';
import { useForm } from '../../context/form/FormContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';

interface AttachmentUploadContextType {
  handleUploadFiles: (attachmentId: string, files: FileObject[]) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  addError: (attachmentId: string, error: string) => void;
  uploadedFiles: UploadedFile[];
  errors: Record<string, string | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFiles: async () => {},
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
  const addToSubmission = (files: UploadedFile[]) => {
    setSubmission(
      (current) => ({ ...current, uploadedFiles: [...(current?.uploadedFiles ?? []), ...files] }) as Submission,
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

  const handleUploadFiles = async (attachmentId: string, files: FileObject[]) => {
    const result = await Promise.all(
      files.map(async ({ file }) => {
        try {
          return await uploadFile(file, attachmentId);
        } catch (_e) {
          addError(attachmentId, 'Det oppstod en feil under opplasting av filen. Prøv igjen senere.');
        }
      }),
    );
    const successfulUploads = result.filter((file): file is UploadedFile => file !== undefined);
    if (successfulUploads.length === result.length) {
      removeError(attachmentId);
    }
    addToSubmission(successfulUploads);
    setInnsendingsId(successfulUploads[0]?.innsendingId);
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

  const value = { handleUploadFiles, handleDeleteFile, handleDeleteAttachment, addError, uploadedFiles, errors };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
