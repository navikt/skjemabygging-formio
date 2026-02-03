import { StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { b64toBlob, http as baseHttp, useAppConfig } from '../../index';

const useFormsApiStaticPdf = () => {
  const appConfig = useAppConfig();
  const { baseUrl } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const getUrl = (formPath: string, languageCode?: string) =>
    `${baseUrl ?? ''}/api/forms/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;

  const getAll = async (formPath: string) => {
    return (await http.get<StaticPdf[]>(getUrl(formPath))) ?? [];
  };

  const uploadPdf = async (formPath: string, languageCode: string, file: File) => {
    const formData = new FormData();
    formData.append('fileContent', file);
    return await http.postFile<StaticPdf>(getUrl(formPath, languageCode), formData);
  };

  const downloadPdf = async (formPath: string, languageCode: string) => {
    const response = await http.get<{ pdfBase64: string }>(getUrl(formPath, languageCode));
    return b64toBlob(response.pdfBase64, 'application/pdf');
  };

  const deletePdf = async (formPath: string, languageCode: string) => {
    return await http.delete(getUrl(formPath, languageCode));
  };

  return useMemo(
    () => ({
      getAll,
      uploadPdf,
      downloadPdf,
      deletePdf,
    }),
    // Adding dependencies will cause unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};

export default useFormsApiStaticPdf;
