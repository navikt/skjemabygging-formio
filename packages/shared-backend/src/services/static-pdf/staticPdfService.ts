import { ResponseError, StaticPdf } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import http from '../http/http';
import { logger } from '../logger/logger';

interface CreateUrlType {
  baseUrl: string;
  formPath: string;
  languageCode?: string;
}
const createUrl = ({ baseUrl, formPath, languageCode }: CreateUrlType) => {
  return `${baseUrl}/v1/forms/${formPath}/static-pdfs${languageCode ? `/${languageCode}` : ''}`;
};

const getValidLanguageCode = async (props: CreateUrlType) => {
  const { formPath, languageCode } = props;

  if (!languageCode) {
    throw new ResponseError('BAD_REQUEST', 'Language code is required to download a static pdf');
  }

  const all = await getAll(props);
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

const getAll = async (props: Omit<CreateUrlType, 'languageCode'>) => {
  const { baseUrl, formPath } = props;
  logger.debug(`Get all static pdfs ${formPath}`);

  return await http.get<StaticPdf[]>(
    createUrl({
      baseUrl,
      formPath,
    }),
  );
};

const downloadPdf = async (props: CreateUrlType) => {
  const { formPath, languageCode } = props;
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  const validLanguageCode = await getValidLanguageCode(props);

  const pdf = await http.get<string>(
    createUrl({
      ...props,
      languageCode: validLanguageCode,
    }),
  );

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'PDF not found');
  }

  return pdf;
};

interface UploadPdfType extends CreateUrlType {
  accessToken: string;
  file: Express.Multer.File;
}
const uploadPdf = async (props: UploadPdfType) => {
  const { formPath, languageCode, accessToken, file } = props;
  logger.info(`Upload new static pdf ${formPath} for ${languageCode}`);

  const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
  const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  const body = new FormData();
  body.append('fileContent', fileBlob, originalFileName);

  return await http.post<StaticPdf>(createUrl(props), body, {
    accessToken,
    contentType: undefined,
  });
};

interface DeletePdfType extends CreateUrlType {
  accessToken: string;
}
const deletePdf = async (props: DeletePdfType) => {
  const { formPath, languageCode, accessToken } = props;
  logger.info(`Delete static pdf ${formPath} for ${languageCode}`);

  await http.delete(createUrl(props), undefined, { accessToken });
};

const staticPdfService = {
  getAll,
  uploadPdf,
  downloadPdf,
  deletePdf,
};

export default staticPdfService;
