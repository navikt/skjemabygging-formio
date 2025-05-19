import { dataFetcher } from './DataFetcherUtils';

export interface DataFetcherElement {
  value: string;
  label: string;
  [key: string]: string;
}

export type DataFetcherData = {
  data?: DataFetcherElement[];
  fetchError?: boolean;
  fetchDisabled?: boolean;
};

export type DataFetcherUtil = {
  fetchDone: undefined | boolean;
  fetchDisabled: boolean;
  ready: boolean;
  empty: boolean | undefined;
  success: boolean | undefined;
  failure: boolean | undefined;
  selected: (matcher: 'COUNT' | 'OTHER' | Record<string, any>) => boolean | number | undefined;
  getAllSelected: () => DataFetcherElement[];
  apiResult: DataFetcherData;
};

export const dataFetcherUtils = { dataFetcher };
