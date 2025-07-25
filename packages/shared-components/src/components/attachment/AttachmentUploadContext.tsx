import { FileObject } from '@navikt/ds-react';
import { Submission, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { deleteFile, uploadFile } from '../../api/nologin-file-upload/nologinFileUpload';
import { useForm } from '../../context/form/FormContext';
import { useSendInn } from '../../context/sendInn/sendInnContext';

interface AttachmentUploadContextType {
  handleUploadFiles: (vedleggId: string, files: FileObject[]) => Promise<void>;
  handleDeleteFile: (vedleggId: string, fileId: string) => Promise<void>;
  addError: (vedleggId: string, error: string) => void;
  uploadedFiles: UploadedFile[];
  errors: Record<string, string | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFiles: async () => {},
  handleDeleteFile: async () => {},
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
  const deleteFromSubmission = (fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          uploadedFiles: (current?.uploadedFiles ?? []).filter((file) => file.filId !== fileId),
        }) as Submission,
    );
  };

  console.log(uploadedFiles);
  const addError = (vedleggId: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [vedleggId]: error,
    }));
  };

  const removeError = (vedleggId: string) => {
    setErrors((prev) => {
      const { [vedleggId]: _, ...rest } = prev; // Remove the error for the specific vedleggId
      return rest;
    });
  };

  const handleUploadFiles = async (vedleggId: string, files: FileObject[]) => {
    const result = await Promise.all(
      files.map(async ({ file }) => {
        try {
          return await uploadFile(file, vedleggId);
        } catch (_e) {
          addError(vedleggId, 'Det oppstod en feil under opplasting av filen. Prøv igjen senere.');
        }
      }),
    );
    const successfulUploads = result.filter((file): file is UploadedFile => file !== undefined);
    if (successfulUploads.length === result.length) {
      removeError(vedleggId);
    }
    addToSubmission(successfulUploads);
    setInnsendingsId(successfulUploads[0]?.innsendingId);
  };

  const handleDeleteFile = async (vedleggId: string, fileId: string) => {
    try {
      await deleteFile(fileId, innsendingsId);
      removeError(vedleggId);
      deleteFromSubmission(fileId);
    } catch (_e) {
      addError(vedleggId, 'Det oppstod en feil under sletting av filen. Prøv igjen senere.');
    }
  };

  const value = { handleUploadFiles, handleDeleteFile, addError, uploadedFiles, errors };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
