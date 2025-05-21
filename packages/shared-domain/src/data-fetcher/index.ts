const dataFetcherSources = {
  activities: {
    description: 'Aktiviteter fra fagsystem',
  },
  none: {
    description: '-',
  },
} as const;

type DataFetcherSourceId = keyof typeof dataFetcherSources;

export type { DataFetcherSourceId };

export { dataFetcherSources };
