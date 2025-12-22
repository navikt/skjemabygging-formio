import { fetchWithErrorHandling } from '../../fetchUtils';
import { logger } from '../../logging/logger';
import { createHeaders } from '../utils/formsApiUtils';

const createStaticPdfService = (formsApiUrl: string) => {
  const baseUrl = `${formsApiUrl}/v1/forms`;
  const getUrl = (formPath: string, languageCode?: string) =>
    `${baseUrl}/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;

  const getAll = async (formPath: string, accessToken: string) => {
    const response = await fetchWithErrorHandling(getUrl(formPath), {
      method: 'GET',
      headers: createHeaders(accessToken),
    });
    return response.data;
  };

  const uploadPdf = async (file: Express.Multer.File, formPath: string, languageCode: string, accessToken: string) => {
    logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);
    const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const form = new FormData();
    form.append('fileContent', fileBlob, originalFileName);

    return await fetchWithErrorHandling(getUrl(formPath, languageCode), {
      method: 'POST',
      headers: createHeaders(accessToken, undefined, true),
      body: form,
    });
  };

  const deletePdf = async (formPath: string, languageCode: string, accessToken: string) => {
    logger.info(`Delete static pdf ${formPath} for ${languageCode}`);
    await fetchWithErrorHandling(getUrl(formPath, languageCode), {
      method: 'DELETE',
      headers: createHeaders(accessToken),
    });
  };

  return {
    getAll,
    uploadPdf,
    deletePdf,
  };
};

export default createStaticPdfService;
