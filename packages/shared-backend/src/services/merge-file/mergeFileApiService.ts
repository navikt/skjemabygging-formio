import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface MergeFilesType {
  baseUrl: string;
  accessToken: string;
  body: {
    tittel: string;
    spraak: string;
    filer: string[];
  };
}
const mergeFiles = async (props: MergeFilesType): Promise<any> => {
  const { baseUrl, body, accessToken } = props;

  logger.info(`Merge files with title ${body.tittel} and language ${body.spraak}`);

  const pdf = await http.post(baseUrl, body, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not find merged file');
  }

  return pdf;
};

const mergeFileApiService = {
  mergeFiles,
};

export default mergeFileApiService;
