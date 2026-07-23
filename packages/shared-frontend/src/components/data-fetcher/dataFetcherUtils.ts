import {
  DataFetcherData,
  DataFetcherElement,
  DataFetcherSourceId,
  dataFetcherUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';

interface SelectableValue {
  value: string;
}

const getSelectedValuesMap = (dataValues: SelectableValue[], selectedValues: string[]): Record<string, boolean> =>
  dataValues.reduce<Record<string, boolean>>(
    (acc, { value }) => ({ ...acc, [value]: selectedValues.includes(value) }),
    {},
  );

const getSelectedValuesAsList = (values?: Record<string, boolean>): string[] => {
  if (!values) {
    return [];
  }

  return Object.entries(values)
    .filter(([, value]) => value)
    .map(([key]) => key);
};

const hasSelectedValue = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && Object.values(value).some(Boolean);

const fetchRegisterData = async (
  dataFetcherSourceId: DataFetcherSourceId,
  queryParams: Record<string, string> = {},
): Promise<DataFetcherElement[]> => {
  const params = new URLSearchParams(queryParams).toString();
  const response = await fetch(`/fyllut/api/register-data/${dataFetcherSourceId}${params ? `?${params}` : ''}`);

  if (!response.ok) {
    throw new Error(`Failed to load register data: ${response.status}`);
  }

  return response.json() as Promise<DataFetcherElement[]>;
};

const getDataFetcherData = (submissionPath: string, submission?: Submission): DataFetcherData | undefined =>
  submission ? dataFetcherUtils.dataFetcher(submissionPath, submission).apiResult : undefined;

export { fetchRegisterData, getDataFetcherData, getSelectedValuesAsList, getSelectedValuesMap, hasSelectedValue };
