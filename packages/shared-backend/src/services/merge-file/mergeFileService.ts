import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../http/http';
import { logger } from '../logger/logger';

interface BodyType {
  title: string;
  language: string;
  files: string[];
}

interface MergeFilesType {
  baseUrl: string;
  accessToken: string;
  body: BodyType;
}
const mergeFiles = async (props: MergeFilesType): Promise<any> => {
  const { baseUrl, body, accessToken } = props;

  logger.info(`Merge files with title ${body.title} and language ${body.language}`);

  const requestBody = {
    tittel: body.title,
    spraak: body.language,
    filer: body.files,
  };

  const pdf = await http.post(baseUrl, requestBody, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not find merged file');
  }

  return pdf;
};

const mergeFileService = {
  mergeFiles,
};

export default mergeFileService;
