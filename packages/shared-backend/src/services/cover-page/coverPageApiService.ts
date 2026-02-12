import { ForstesideRequestBody, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';

interface DownloadCoverPageType {
  baseUrl: string;
  languageCode?: string;
  accessToken?: string;
  body: ForstesideRequestBody;
}
const downloadCoverPage = async (props: DownloadCoverPageType) => {
  const { baseUrl, accessToken, body } = props;
  logger.info(`Download cover page for ${body.navSkjemaId}`);

  const pdf = await http.post<{
    foersteside: string;
    loepenummer: string;
  }>(`${baseUrl}/foersteside`, body, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Cover page not found');
  }

  logger.info(`Cover page for ${body.navSkjemaId} with id (loepenummer) ${pdf.loepenummer} created successfully`);

  return pdf.foersteside;
};

const coverPageApiService = {
  downloadCoverPage,
};

export default coverPageApiService;
