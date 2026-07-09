import { ResponseError, StaticPdf, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

interface GetAllProps {
  baseUrl: string;
  formPath: string;
}
const getAll = async (props: GetAllProps) => {
  const { baseUrl, formPath } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}/static-pdfs`;
  logger.debug('Getting static pdfs', { formPath, targetUrl });

  return await http.get<StaticPdf[]>(targetUrl);
};

interface DownloadPdfProps {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const downloadPdf = async (props: DownloadPdfProps) => {
  const { baseUrl, formPath, languageCode } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}/static-pdfs/${encodeURIComponent(languageCode)}`;
  logger.info('Downloading static pdf', { formPath, languageCode, targetUrl });

  const pdf = await http.get<string>(targetUrl);

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'PDF not found');
  }

  return pdf;
};

interface UploadPdfProps {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
  body: FormData;
}
const uploadPdf = async (props: UploadPdfProps) => {
  const { baseUrl, formPath, languageCode, accessToken, body } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}/static-pdfs/${encodeURIComponent(languageCode)}`;
  logger.info('Uploading static pdf', { formPath, languageCode, targetUrl });

  return await http.post<StaticPdf>(targetUrl, body, {
    accessToken,
    contentType: undefined,
  });
};

interface DeletePdfProps {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
}
const deletePdf = async (props: DeletePdfProps) => {
  const { baseUrl, formPath, languageCode, accessToken } = props;
  const targetUrl = `${baseUrl}/${formsUrl}/${encodeURIComponent(formPath)}/static-pdfs/${encodeURIComponent(languageCode)}`;
  logger.info('Deleting static pdf', { formPath, languageCode, targetUrl });

  await http.delete(targetUrl, undefined, { accessToken });
};

const staticPdfClient = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfClient;
