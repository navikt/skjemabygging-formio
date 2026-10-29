import { CoverPageDownloadType, ResponseError, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import coverPageClient from './coverPageClient';
import { coverPageMapper } from './mapper';
import { SubsequentSubmissionCoverPageData } from './subsequentSubmissionTypes';

type CoverPageClient = Pick<typeof coverPageClient, 'downloadCoverPage'>;

interface DownloadCoverPageProps {
  languageCode?: string;
  accessToken?: string;
  data: CoverPageDownloadType | SubsequentSubmissionCoverPageData;
  translate?: TranslateFunction;
  formNumber?: string;
}

type CoverPageService = {
  downloadCoverPage: (props: DownloadCoverPageProps) => Promise<string>;
};

interface CreateCoverPageServiceProps {
  baseUrl: string;
  client?: CoverPageClient;
}

const createCoverPageService = ({
  baseUrl,
  client = coverPageClient,
}: CreateCoverPageServiceProps): CoverPageService => {
  const downloadCoverPage = async (props: DownloadCoverPageProps) => {
    const { accessToken, data, languageCode, translate, formNumber } = props;
    const { body } = {
      body: coverPageMapper.createRequestBodyFromDownloadData(data, languageCode, translate, formNumber),
    };
    const { submissionType } = data;

    logger.debug(`Download cover page for ${data.form.skjemanummer}`);

    const response = await client.downloadCoverPage({ baseUrl, accessToken, body });
    if (!response || typeof response.foersteside !== 'string' || !response.foersteside.trim()) {
      throw new ResponseError('SERVICE_UNAVAILABLE', 'Invalid cover page response');
    }

    logger.info(
      `Cover page for ${body.navSkjemaId} with id (loepenummer) ${response.loepenummer} created successfully`,
      {
        skjemanummer: body.navSkjemaId,
        submissionMethod: submissionType,
        loepenummer: response.loepenummer,
        foerstesidetype: body.foerstesidetype,
        tema: body.tema,
        enhetsnummer: body.enhetsnummer,
        spraakkode: body.spraakkode,
      },
    );

    return response.foersteside;
  };

  return {
    downloadCoverPage,
  };
};

export { createCoverPageService };
export type { CoverPageService };
