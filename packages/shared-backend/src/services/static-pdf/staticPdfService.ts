import { ResponseError, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import 'multer';
import { logger } from '../../shared/logger/logger';
import staticPdfApiService from './staticPdfApiService';

type StaticPdfApiService = Pick<typeof staticPdfApiService, 'getAll' | 'downloadPdf' | 'uploadPdf' | 'deletePdf'>;

interface GetAllProps {
  formPath: string;
}

interface DownloadPdfProps {
  formPath: string;
  languageCode: TranslationLang;
}

interface UploadPdfProps {
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
  file: Express.Multer.File;
}

interface DeletePdfProps {
  formPath: string;
  languageCode: TranslationLang;
  accessToken: string;
}

type StaticPdfService = {
  getAll: (props: GetAllProps) => ReturnType<StaticPdfApiService['getAll']>;
  uploadPdf: (props: UploadPdfProps) => ReturnType<StaticPdfApiService['uploadPdf']>;
  downloadPdf: (props: DownloadPdfProps) => Promise<string>;
  deletePdf: (props: DeletePdfProps) => Promise<void>;
};

interface CreateStaticPdfServiceProps {
  baseUrl: string;
  apiService?: StaticPdfApiService;
}

const createStaticPdfService = ({
  baseUrl,
  apiService = staticPdfApiService,
}: CreateStaticPdfServiceProps): StaticPdfService => {
  const getAll = async (props: GetAllProps) => {
    const { formPath } = props;

    return apiService.getAll({ baseUrl, formPath });
  };

  const getValidLanguageCode = async (props: DownloadPdfProps) => {
    const { formPath, languageCode } = props;

    if (!languageCode) {
      throw new ResponseError('BAD_REQUEST', 'Language code is required to download a static pdf');
    }

    const all = await getAll({ formPath });
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

  const downloadPdf = async (props: DownloadPdfProps) => {
    const { formPath } = props;

    const validLanguageCode = await getValidLanguageCode(props);
    return apiService.downloadPdf({ baseUrl, formPath, languageCode: validLanguageCode });
  };

  const uploadPdf = async (props: UploadPdfProps) => {
    const { formPath, languageCode, accessToken, file } = props;

    const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const body = new FormData();
    body.append('fileContent', fileBlob, originalFileName);

    return apiService.uploadPdf({ baseUrl, formPath, languageCode, accessToken, body });
  };

  const deletePdf = async (props: DeletePdfProps) => {
    const { formPath, languageCode, accessToken } = props;
    await apiService.deletePdf({ baseUrl, formPath, languageCode, accessToken });
  };

  return {
    getAll,
    uploadPdf,
    downloadPdf,
    deletePdf,
  };
};

export { createStaticPdfService };
export type { StaticPdfService };
