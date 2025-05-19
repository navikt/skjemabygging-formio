import { DataFetcherElement } from '../utils/data-fetcher';

export interface Activity extends DataFetcherElement {
  value: string;
  label: string;
  type: string;
}
