const dataFetcherSources = {
  activities: 'activities',
  none: 'none',
} as const;

type DataFetcherSourceId = keyof typeof dataFetcherSources;

export type { DataFetcherSourceId };

export { dataFetcherSources };
