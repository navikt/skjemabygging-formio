import { createCounterMetric, createDurationMetric, MetricServiceConfig } from '../metrics/metricService';

const createApplicationPdfMetrics = (config?: MetricServiceConfig) => {
  return {
    failures: createCounterMetric(config, {
      metricName: 'familie_pdf_failures_total',
      help: 'Number of familie pdf requests which failed',
    }),
    requests: createCounterMetric(config, {
      metricName: 'familie_pdf_requests_total',
      help: 'Number of familie pdf requests',
    }),
    duration: createDurationMetric(config, {
      metricName: 'familie_pdf_duration_seconds',
      help: 'Request duration for familie pdf requests in seconds',
    }),
  };
};

export { createApplicationPdfMetrics };
