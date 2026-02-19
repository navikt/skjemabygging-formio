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
  logger.debug(`Get all static pdfs ${formPath}`);

  return await http.get<StaticPdf[]>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs`);
};

interface DownloadPdfProps {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const downloadPdf = async (props: DownloadPdfProps) => {
  const { baseUrl, formPath, languageCode } = props;
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  const pdf = await http.get<string>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs/${languageCode}`);

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
  logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);

  return await http.post<StaticPdf>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs/${languageCode}`, body, {
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
  logger.info(`Delete static pdf ${formPath} for ${languageCode}`);

  await http.delete(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs/${languageCode}`, undefined, { accessToken });
};

const staticPdfApiService = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfApiService;
