import { StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useFormsApiStaticPdf from '../../api/useFormsApiStaticPdf';

interface StaticPdfContextType {
  formPath: string;
  loading: boolean;
  getFile: (languageCode: string) => StaticPdf | undefined;
  uploadFile: (languageCode: string, file: File) => Promise<StaticPdf>;
  deleteFile: (languageCode: string) => Promise<void>;
}

interface Props {
  children: React.ReactNode;
  formPath: string;
}

const StaticPdfContext = createContext<StaticPdfContextType>({} as StaticPdfContextType);

export const StaticPdfProvider = ({ children, formPath }: Props) => {
  const [files, setFiles] = useState<StaticPdf[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { getAll, uploadPdf, deletePdf } = useFormsApiStaticPdf();

  const removeFromFiles = useCallback((languageCode: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.languageCode !== languageCode));
  }, []);

  const addToFiles = useCallback((file: StaticPdf) => {
    setFiles((prevFiles) => [...prevFiles, file]);
  }, []);

  const getFiles = useCallback(async () => {
    setLoading(true);
    try {
      const allFiles = await getAll(formPath);
      setFiles(allFiles);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formPath]);

  const getFile = (languageCode: string) => {
    if (files) {
      return files.find((file) => file.languageCode === languageCode);
    }
  };

  const uploadFile = useCallback(
    async (languageCode: string, file: File) => {
      setLoading(true);
      try {
        const uploadedFile = await uploadPdf(formPath, languageCode, file);
        addToFiles(uploadedFile);
        return uploadedFile;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formPath, addToFiles],
  );

  const deleteFile = useCallback(
    async (languageCode: string) => {
      setLoading(true);
      try {
        await deletePdf(formPath, languageCode);
        removeFromFiles(languageCode);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formPath, removeFromFiles],
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
        loading,
        getFile,
        uploadFile,
        deleteFile,
      }}
    >
      {children}
    </StaticPdfContext.Provider>
  );
};

export const useStaticPdf = () => useContext(StaticPdfContext);

export type { StaticPdfContextType };
