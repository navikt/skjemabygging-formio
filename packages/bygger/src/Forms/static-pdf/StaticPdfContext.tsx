import { StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApiStaticPdf from '../../api/useFormsApiStaticPdf';

interface StaticPdfContextType {
  formPath: string;
  loadingFiles: boolean;
  getFile: (languageCode: string) => StaticPdf | undefined;
  uploadFile: (languageCode: string, file: File) => Promise<StaticPdf>;
  downloadFile: (languageCode: string) => Promise<Blob>;
  deleteFile: (languageCode: string) => Promise<void>;
}

interface Props {
  children: React.ReactNode;
  formPath: string;
}

const StaticPdfContext = createContext<StaticPdfContextType>({} as StaticPdfContextType);

export const StaticPdfProvider = ({ children, formPath }: Props) => {
  const [files, setFiles] = useState<StaticPdf[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const { getAll, uploadPdf, deletePdf, downloadPdf } = useFormsApiStaticPdf();

  const removeFile = useCallback((languageCode: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.languageCode !== languageCode));
  }, []);

  const addOrReplaceFile = useCallback((file: StaticPdf) => {
    setFiles((prevFiles) => {
      return [...prevFiles.filter((f) => f.languageCode !== file.languageCode), file];
    });
  }, []);

  const getFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const allFiles = await getAll(formPath);
      setFiles(allFiles);
    } finally {
      setLoadingFiles(false);
    }
  }, [formPath, getAll]);

  const getFile = (languageCode: string) => {
    if (files) {
      return files.find((file) => file.languageCode === languageCode);
    }
  };

  const uploadFile = useCallback(
    async (languageCode: string, file: File) => {
      const uploadedFile = await uploadPdf(formPath, languageCode, file);
      addOrReplaceFile(uploadedFile);
      return uploadedFile;
    },
    [formPath, addOrReplaceFile, uploadPdf],
  );

  const downloadFile = useCallback(
    async (languageCode: string) => {
      return await downloadPdf(formPath, languageCode);
    },
    [formPath, downloadPdf],
  );

  const deleteFile = useCallback(
    async (languageCode: string) => {
      await deletePdf(formPath, languageCode);
      removeFile(languageCode);
    },
    [formPath, removeFile, deletePdf],
  );

  useEffect(() => {
    (async () => {
      await getFiles();
    })();
  }, [getFiles]);

  return (
    <StaticPdfContext.Provider
      value={{
        formPath,
        loadingFiles,
        getFile,
        uploadFile,
        downloadFile,
        deleteFile,
      }}
    >
      {children}
    </StaticPdfContext.Provider>
  );
};

export const useStaticPdf = () => useContext(StaticPdfContext);

export type { StaticPdfContextType };
