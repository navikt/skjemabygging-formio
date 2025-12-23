import { b64toBlob, http as baseHttp, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';

const useFormsApiStaticPdf = () => {
  const feedbackEmit = useFeedbackEmit();
  const appConfig = useAppConfig();
  const { logger } = appConfig;
  const http = appConfig.http ?? baseHttp;
  const baseUrl = '/api/forms';
  const getUrl = (formPath: string, languageCode?: string) =>
    `${baseUrl}/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;

  const getAll = async (formPath: string) => {
    try {
      return (await http.get<StaticPdf[]>(getUrl(formPath))) ?? [];
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error('Failed to fetch static pdfs', { message });
      feedbackEmit.error('Feil ved henting av pdf-filer');
      throw error;
    }
  };

  const uploadPdf = async (formPath: string, languageCode: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('fileContent', file);
      const response = await http.postFile<{ data: StaticPdf }>(getUrl(formPath, languageCode), formData);
      return response?.data;
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error('Failed upload static pdf', { message });
      feedbackEmit.error('Feil ved opplasting av pdf');
      throw error;
    }
  };

  const downloadPdf = async (formPath: string, languageCode: string) => {
    try {
      const response = await http.get<{ pdfBase64: string }>(getUrl(formPath, languageCode));
      return b64toBlob(response.pdfBase64, 'application/pdf');
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error('Failed to download static pdf', { message });
      feedbackEmit.error('Feil ved nedlasting av pdf');
      throw error;
    }
  };

  const deletePdf = async (formPath: string, languageCode: string) => {
    try {
      return await http.delete(getUrl(formPath, languageCode));
    } catch (error) {
      const message = (error as Error)?.message;
      logger?.error('Failed to delete static pdf', { message });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
};

export default useFormsApiStaticPdf;
