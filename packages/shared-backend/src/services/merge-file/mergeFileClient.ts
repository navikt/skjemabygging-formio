import { HttpResponseError, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
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

const toMergeError = (error: unknown): unknown => {
  if (!(error instanceof HttpResponseError)) {
    return error;
  }

  const upstreamMessage = typeof error.body === 'string' ? error.body : error.body?.message;
  const message =
    typeof upstreamMessage === 'string' &&
    upstreamMessage.includes('Unexpected end of base64-encoded String') &&
    upstreamMessage.includes('expects padding')
      ? 'PDF merge failed: invalid base64 padding'
      : 'PDF merge request failed';

  return new ResponseError(error.errorCode, message, error.correlationId);
};

const mergeFiles = async (props: MergeFilesProps): Promise<any> => {
  const { baseUrl, body, accessToken } = props;
  const targetUrl = `${baseUrl}${mergeFilesPath}`;

  logger.info('Merging files', {
    languageCode: body.spraak,
    fileCount: body.filer.length,
    targetUrl,
  });

  const pdf = await http.post(targetUrl, body, { accessToken }).catch((error: unknown) => {
    throw toMergeError(error);
  });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Could not find merged file');
  }

  return pdf;
};

const mergeFileClient = {
  mergeFiles,
};

export default mergeFileClient;
