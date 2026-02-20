const dataFetcherSources = {
  activities: {
    description: 'Aktiviteter fra fagsystem',
  },
  none: {
    description: '-',
  },
} as const;

type DataFetcherSourceId = keyof typeof dataFetcherSources;

interface DataFetcherElement {
  value: string;
  label: string;
  [key: string]: string;
}

type DataFetcherData = {
  data?: DataFetcherElement[];
  fetchError?: boolean;
  fetchDisabled?: boolean;
};

type DataFetcherUtil = {
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

interface Activity extends DataFetcherElement {
  value: string;
  label: string;
  type: string;
}

export type { Activity, DataFetcherData, DataFetcherElement, DataFetcherSourceId, DataFetcherUtil };

export { dataFetcherSources };
