import fetch from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { LogMetadata } from '../../types/log';
import { responseToError } from '../../utils/errorHandling';

interface MergeFilesBody {
  tittel: string;
  spraak: string;
  filer: string[];
}
const { sendInnConfig } = config;

export const mergeFrontPageAndApplication = async (
  accessToken: string,
  title: string,
  language: string,
  frontpage: Buffer<ArrayBuffer>,
  application: Buffer<ArrayBuffer>,
  logMeta: LogMetadata = {},
): Promise<any> => {
  const fileList: string[] = [frontpage.toString('base64'), application.toString('base64')];

  const body: MergeFilesBody = {
    tittel: title,
    spraak: language,
    filer: fileList,
  };

  const mergedFileResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.mergeFiles}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (mergedFileResponse.ok) {
    logger.info('Successfylly merged frontpage and application', logMeta);
    return await mergedFileResponse.arrayBuffer();
  }
  const errorMessage = 'Merge of frontpage and application failed';
  logger.info(errorMessage, logMeta);
  throw await responseToError(mergedFileResponse, errorMessage, false);
};
