import fetch from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
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
): Promise<any> => {
  const fileList: string[] = [frontpage.toString('base64'), application.toString('base64')];

  const body: MergeFilesBody = {
    tittel: title,
    spraak: language,
    filer: fileList,
  };

  try {
    const mergedFileResponse = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.mergeFiles}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (mergedFileResponse.ok) {
      logger.info('Successfylly merged frontpage and application');
      return await mergedFileResponse.arrayBuffer();
    } else {
      logger.info('Merge of frontpage and application failed');
      return await responseToError(mergedFileResponse, `Feil ved kall til SendInn. ${mergedFileResponse}`, true);
    }
  } catch (err) {
    logger.error(`Request to merge pdfs service failed with  ${err}`);
    throw err;
  }
};
