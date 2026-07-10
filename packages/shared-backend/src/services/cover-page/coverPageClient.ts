import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import { ForstesideRequestBody } from './coverPageRequestTypes';

interface DownloadCoverPageProps {
  baseUrl: string;
  accessToken?: string;
  body: ForstesideRequestBody;
}
const downloadCoverPage = async (props: DownloadCoverPageProps) => {
  const { baseUrl, accessToken, body } = props;
  const targetUrl = `${baseUrl}/foersteside`;
  logger.info('Downloading cover page', {
    navSkjemaId: body.navSkjemaId,
    targetUrl,
  });

  const pdf = await http.post<{
    foersteside: string;
    loepenummer: string;
  }>(targetUrl, body, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Cover page not found');
  }

  return pdf;
};

const coverPageClient = {
  downloadCoverPage,
};

export default coverPageClient;
