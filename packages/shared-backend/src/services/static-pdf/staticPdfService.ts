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

const getAll = async (props: Omit<CreateUrlType, 'languageCode'>) => {
  const { formPath } = props;
  logger.debug(`Get all static pdfs ${formPath}`);

  return await http.get<StaticPdf[]>(createUrl(props));
};

const downloadPdf = async (props: CreateUrlType) => {
  const { formPath, languageCode } = props;
  logger.info(`Download new static pdf ${formPath} for ${languageCode}`);

  const pdf = await http.get<string>(createUrl(props));

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
