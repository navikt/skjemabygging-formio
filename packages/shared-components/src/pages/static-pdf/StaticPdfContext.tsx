import { Component, CoverPageDownloadType, StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import useFormsApiStaticPdf from '../../api/static-pdf/useFormsApiStaticPdf';
import { useForm } from '../../context/form/FormContext';
import { getFilteredStaticPdfAttachments } from './staticPdfAttachmentFilter';

interface StaticPdfContextType {
  formPath: string;
  filteredAttachments: Component[];
  isEttersending: boolean;
  loadingFiles: boolean;
  files: StaticPdf[];
  getFile: (languageCode: string) => StaticPdf | undefined;
  uploadFile: (languageCode: string, file: File) => Promise<StaticPdf>;
  downloadFile: (languageCode: string) => Promise<Blob>;
  downloadCoverPageAndFile: (coverPage: CoverPageDownloadType) => Promise<Blob>;
  deleteFile: (languageCode: string) => Promise<void>;
}

interface Props {
  children: React.ReactNode;
  formPath: string;
  isEttersending?: boolean;
}

const StaticPdfContext = createContext<StaticPdfContextType>({} as StaticPdfContextType);

export const StaticPdfProvider = ({ children, formPath, isEttersending = false }: Props) => {
  const { form } = useForm();
  const [searchParams] = useSearchParams();
  const filterValue = searchParams.get('filter');
  const [files, setFiles] = useState<StaticPdf[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const { getAll, uploadPdf, deletePdf, downloadPdf, downloadCoverPageAndPdf } = useFormsApiStaticPdf();
  const filteredAttachments = useMemo(
    () => getFilteredStaticPdfAttachments(form.components, filterValue),
    [filterValue, form.components],
  );

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
    if (files?.length > 0) {
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

  const downloadCoverPageAndFile = useCallback(
    async (coverPage: CoverPageDownloadType) => {
      return await downloadCoverPageAndPdf(formPath, {
        ...coverPage,
        submissionType: 'STATIC_PDF',
        ...(isEttersending ? { type: 'ETTERSENDELSE' } : {}),
      });
    },
    [formPath, isEttersending, downloadCoverPageAndPdf],
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
        filteredAttachments,
        isEttersending,
        loadingFiles,
        files,
        getFile,
        uploadFile,
        downloadFile,
        downloadCoverPageAndFile,
        deleteFile,
      }}
    >
      {children}
    </StaticPdfContext.Provider>
  );
};

export const useStaticPdf = () => useContext(StaticPdfContext);

export type { StaticPdfContextType };
