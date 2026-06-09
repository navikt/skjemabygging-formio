import { CoverPageDownloadType, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../../shared/logger/logger';
import coverPageClient from './coverPageClient';
import { coverPageMapper } from './mapper';

type CoverPageClient = Pick<typeof coverPageClient, 'downloadCoverPage'>;

interface DownloadCoverPageProps {
  languageCode?: string;
  accessToken?: string;
  data: CoverPageDownloadType;
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

    const response = await client.downloadCoverPage({
      baseUrl,
      accessToken,
      body,
    });

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
