import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

const mergeFilesPath = '/fyllUt/v1/merge-filer';

interface MergeFilesProps {
  baseUrl: string;
  accessToken: string;
  body: {
    tittel: string;
    spraak: string;
    filer: string[];
  };
}
const mergeFiles = async (props: MergeFilesProps): Promise<any> => {
  const { baseUrl, body, accessToken } = props;
  const targetUrl = `${baseUrl}${mergeFilesPath}`;

  logger.info('Merging files', {
    languageCode: body.spraak,
    fileCount: body.filer.length,
    targetUrl,
  });

  const pdf = await http.post(targetUrl, body, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not find merged file');
  }

  return pdf;
};

const mergeFileClient = {
  mergeFiles,
};

export default mergeFileClient;
