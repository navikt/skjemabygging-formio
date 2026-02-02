import { StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useFeedbackEmit } from '../../../../bygger/src/context/notifications/FeedbackContext';
import { b64toBlob, http as baseHttp, useAppConfig } from '../../index';

const useFormsApiStaticPdf = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const { baseUrl } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const getUrl = (formPath: string, languageCode?: string) =>
    `${baseUrl ?? ''}/api/forms/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;

  const getAll = async (formPath: string) => {
    try {
      return (await http.get<StaticPdf[]>(getUrl(formPath))) ?? [];
    } catch (error) {
      feedbackEmit.error('Feil ved henting av pdf-filer');
      throw error;
    }
  };

  const uploadPdf = async (formPath: string, languageCode: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('fileContent', file);
      return await http.postFile<StaticPdf>(getUrl(formPath, languageCode), formData);
    } catch (error) {
      feedbackEmit.error('Feil ved opplasting av pdf');
      throw error;
    }
  };

  const downloadPdf = async (formPath: string, languageCode: string) => {
    try {
      const response = await http.get<{ pdfBase64: string }>(getUrl(formPath, languageCode));
      return b64toBlob(response.pdfBase64, 'application/pdf');
    } catch (error) {
      feedbackEmit.error('Feil ved nedlasting av pdf');
      throw error;
    }
  };

  const deletePdf = async (formPath: string, languageCode: string) => {
    try {
      return await http.delete(getUrl(formPath, languageCode));
    } catch (error) {
      feedbackEmit.error('Feil ved sletting av pdf');
      throw error;
    }
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
