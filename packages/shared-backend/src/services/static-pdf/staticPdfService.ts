import { ResponseError, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import { logger } from '../logger/logger';
import staticPdfApiService from './staticPdfApiService';

const getValidLanguageCode = async (props: DownloadPdfType) => {
  const { baseUrl, formPath, languageCode } = props;

  if (!languageCode) {
    throw new ResponseError('BAD_REQUEST', 'Language code is required to download a static pdf');
  }

  const all = await getAll({ baseUrl, formPath });
  const languageCodes = all.map((staticPdf) => staticPdf.languageCode);

  if (languageCodes.length === 0) {
    throw new ResponseError('BAD_REQUEST', `No static pdfs found for form ${formPath}`);
  }

  if (languageCodes.includes(languageCode)) {
    return languageCode;
  } else if (languageCode !== 'nn' && languageCodes.includes('en')) {
    logger.info(`Downloading static pdf for ${formPath} in english, since ${languageCode} was not found.`);
    return 'en';
  } else if (languageCodes.includes('nb')) {
    logger.info(`Downloading static pdf for ${formPath} in bokmål, since ${languageCode} was not found.`);
    return 'nb';
  }

  throw new ResponseError(
    'BAD_REQUEST',
    `Language code ${languageCode} is not valid for form ${formPath} and not other valid fallback languages found`,
  );
};

interface GetAllType {
  baseUrl: string;
  formPath: string;
}
const getAll = async (props: GetAllType) => {
  const { baseUrl, formPath } = props;

  return staticPdfApiService.getAll({ baseUrl, formPath });
};

interface DownloadPdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
}
const downloadPdf = async (props: DownloadPdfType) => {
  const { baseUrl, formPath } = props;

  const validLanguageCode = await getValidLanguageCode(props);
  return staticPdfApiService.downloadPdf({ baseUrl, formPath, languageCode: validLanguageCode });
};

interface UploadPdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
  file: Express.Multer.File;
}
const uploadPdf = async (props: UploadPdfType) => {
  const { baseUrl, formPath, languageCode, accessToken, file } = props;

  const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
  const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const body = new FormData();
  body.append('fileContent', fileBlob, originalFileName);

  return staticPdfApiService.uploadPdf({ baseUrl, formPath, languageCode, accessToken, body });
};

interface DeletePdfType {
  baseUrl: string;
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
}
const deletePdf = async (props: DeletePdfType) => {
  await staticPdfApiService.deletePdf(props);
};

const staticPdfService = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfService;
