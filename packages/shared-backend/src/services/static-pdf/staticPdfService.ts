import { ErrorResponse, StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import http from '../../util/http';
import { logger } from '../../util/logger';
import service from '../../util/service';

const createUrl = (baseUrl: string, formPath: string, languageCode?: string) =>
  `${baseUrl}/v1/forms/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;

const getAll = async (baseUrl: string, formPath: string) => {
  logger.debug(`Get all static pdfs ${formPath}`);

  service.isFormPathValid(formPath);

  return await http.get<StaticPdf[]>(createUrl(baseUrl, formPath));
};

const downloadPdf = async (baseUrl: string, formPath: string, languageCode: string) => {
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  service.isFormPathValid(formPath);

  const pdf = await http.get(createUrl(baseUrl, formPath, languageCode));
  if (pdf) {
    return { pdfBase64: pdf };
  } else {
    throw {
      message: 'PDF not found',
      status: 404,
      errorCode: 'NOT_FOUND',
    } as ErrorResponse;
  }
};

const uploadPdf = async (
  baseUrl: string,
  formPath: string,
  languageCode: string,
  accessToken: string,
  file?: Express.Multer.File,
) => {
  service.isFormPathValid(formPath);

  logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);

  if (!file?.buffer) {
    throw {
      message: 'No file in request',
      status: 400,
      errorCode: 'BAD_REQUEST',
    } as ErrorResponse;
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
  service.isFormPathValid(formPath);

  logger.info(`Delete static pdf ${formPath} for ${languageCode}`);

  await http.delete(createUrl(baseUrl, formPath, languageCode), { accessToken });
};

const staticPdfService = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfService;
