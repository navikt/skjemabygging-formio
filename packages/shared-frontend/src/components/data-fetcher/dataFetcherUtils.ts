import { DataFetcherData, dataFetcherUtils, Submission } from '@navikt/skjemadigitalisering-shared-domain';

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

const isSelectedValuesMap = (value: unknown): value is Record<string, boolean> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The chosen options of a stored `{ option: boolean }` map, the way a checkbox group renders them. */
const toSelectedValuesList = (value: unknown): string[] =>
  getSelectedValuesAsList(isSelectedValuesMap(value) ? value : undefined);

const getDataFetcherData = (submissionPath: string, submission?: Submission): DataFetcherData | undefined =>
  submission ? dataFetcherUtils.dataFetcher(submissionPath, submission).apiResult : undefined;

export { getDataFetcherData, getSelectedValuesAsList, getSelectedValuesMap, isSelectedValuesMap, toSelectedValuesList };
