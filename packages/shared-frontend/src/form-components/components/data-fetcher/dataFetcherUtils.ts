import { DataFetcherData, dataFetcherUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';

const getDataFetcherData = (submissionPath: string, submission?: Submission): DataFetcherData | undefined =>
  submission ? dataFetcherUtils.dataFetcher(submissionPath, submission).apiResult : undefined;

export { getDataFetcherData };
