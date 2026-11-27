import { createCounterMetric, MetricServiceConfig } from '../metrics/metricService';

const FORM_DEFINITION_FETCH_RESULTS = ['hit', 'miss', 'error'] as const;

type FormDefinitionFetchResult = (typeof FORM_DEFINITION_FETCH_RESULTS)[number];

const createFormMetrics = (config?: MetricServiceConfig) => {
  return {
    fetches: createCounterMetric<'result'>(config, {
      metricName: 'form_definition_fetches_total',
      help: 'Number of form definition fetches by result',
      labelNames: ['result'],
      zeroValues: FORM_DEFINITION_FETCH_RESULTS.map((result) => ({ result })),
    }),
  };
};

export { createFormMetrics };
export type { FormDefinitionFetchResult };
