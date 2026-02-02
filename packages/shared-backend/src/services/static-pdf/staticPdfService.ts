import { ResponseError, StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import http from '../http/http';
import { logger } from '../logger/logger';

const createUrl = (baseUrl: string, formPath: string, languageCode?: string) => {
  return `${baseUrl}/v1/forms/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;
};

const getAll = async (baseUrl: string, formPath: string) => {
  logger.debug(`Get all static pdfs ${formPath}`);

  return await http.get<StaticPdf[]>(createUrl(baseUrl, formPath));
};

const downloadPdf = async (baseUrl: string, formPath: string, languageCode: string) => {
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  const pdf = await http.get(createUrl(baseUrl, formPath, languageCode));
  if (pdf) {
    return { pdfBase64: pdf };
  } else {
    throw new ResponseError('NOT_FOUND', 'PDF not found');
  }
};

const uploadPdf = async (
  baseUrl: string,
  formPath: string,
  languageCode: string,
  accessToken: string,
  file?: Express.Multer.File,
) => {
  logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);

  if (!file?.buffer) {
    throw new ResponseError('BAD_REQUEST', 'No file in request');
  }

  const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
  const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const body = new FormData();
  body.append('fileContent', fileBlob, originalFileName);

  return await http.post<StaticPdf>(createUrl(baseUrl, formPath, languageCode), body, {
    accessToken,
    contentType: undefined,
  });
};

const deletePdf = async (baseUrl: string, formPath: string, languageCode: string, accessToken: string) => {
  logger.info(`Delete static pdf ${formPath} for ${languageCode}`);

  await http.delete(createUrl(baseUrl, formPath, languageCode), undefined, { accessToken });
};

const staticPdfService = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfService;
