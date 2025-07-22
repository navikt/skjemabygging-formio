import { FileObject } from '@navikt/ds-react';
import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { deleteFile, uploadFile } from '../../api/nologin-file-upload/nologinFileUpload';

interface AttachmentUploadContextType {
  handleUploadFiles: (vedleggId: string, files: FileObject[]) => Promise<void>;
  handleDeleteFile: (vedleggId: string, fileId: string) => Promise<void>;
  addError: (vedleggId: string, error: string) => void;
  uploadedFiles: Record<string, UploadedFile[]>;
  errors: Record<string, string | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFiles: async () => {},
  handleDeleteFile: async () => {},
  addError: () => {},
  uploadedFiles: {},
  errors: {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [innsendingsId, setInnsendingsId] = useState<string | undefined>(undefined);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

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
    setUploadedFiles((current) => ({ ...current, [vedleggId]: [...(current[vedleggId] ?? []), ...successfulUploads] }));
    setInnsendingsId(successfulUploads[0]?.innsendingId);
  };

  const handleDeleteFile = async (vedleggId: string, fileId: string) => {
    try {
      await deleteFile(fileId, innsendingsId);
      removeError(vedleggId);
      return setUploadedFiles((files) => {
        const updatedattachmentFiles = files[vedleggId].filter((file) => file.filId !== fileId);
        return {
          ...files,
          [vedleggId]: updatedattachmentFiles,
        };
      });
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
