import { ResponseError, StaticPdf, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const formsUrl = 'v1/forms';

interface GetAllType {
  baseUrl: string;
  formPath: string;
}
const getAll = async (props: GetAllType) => {
  const { baseUrl, formPath } = props;
  logger.debug(`Get all static pdfs ${formPath}`);

  return await http.get<StaticPdf[]>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs`);
};

interface DownloadPdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const downloadPdf = async (props: DownloadPdfType) => {
  const { baseUrl, formPath, languageCode } = props;
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  const pdf = await http.get<string>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs/${languageCode}`);

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'PDF not found');
  }

  return pdf;
};

interface UploadPdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
  body: FormData;
}
const uploadPdf = async (props: UploadPdfType) => {
  const { baseUrl, formPath, languageCode, accessToken, body } = props;
  logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);

  return await http.post<StaticPdf>(`${baseUrl}/${formsUrl}/${formPath}/static-pdfs/${languageCode}`, body, {
    accessToken,
    contentType: undefined,
  });
};

interface DeletePdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
}
const deletePdf = async (props: DeletePdfType) => {
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
